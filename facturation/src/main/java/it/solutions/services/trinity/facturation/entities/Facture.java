package it.solutions.services.trinity.facturation.entities;

import it.solutions.services.trinity.contracts.entities.ConsultationLight;
import it.solutions.services.trinity.contracts.entities.PatientLight;
import it.solutions.services.trinity.core.shared.entities.BaseEntity;
import it.solutions.services.trinity.core.shared.enums.StatutFacture;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;


@Entity
@Table(name = "factures")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Facture extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id", nullable = false)
    private ConsultationLight consultation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientLight patient;

    @NotBlank
    @Column(name = "numero_facture", nullable = false, unique = true, length = 50)
    private String numeroFacture;

    @Column(name = "date_emission", nullable = false)
    private LocalDateTime dateEmission;

    @NotNull
    @Column(name = "montant_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal montantTotal = BigDecimal.ZERO;

    @NotNull
    @Column(name = "montant_paye", nullable = false, precision = 12, scale = 2)
    private BigDecimal montantPaye = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutFacture statut = StatutFacture.IMPAYEE;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "pdf_path", length = 500)
    private String pdfPath;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder.Default
    @OneToMany(
            mappedBy = "facture",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<FactureLigne> lignes = new ArrayList<>();

    @Builder.Default
    @OneToMany(
            mappedBy = "facture",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @OrderBy("datePaiement DESC")
    private Set<Paiement> paiements = new LinkedHashSet<>();

    @PrePersist
    protected void onCreate() {
        this.dateEmission = this.dateEmission != null ? this.dateEmission : LocalDateTime.now();
    }



    // ── Helpers ──────────────────────────────────────────────
    public void addLigne(FactureLigne ligne) {
        this.lignes.add(ligne);
        ligne.setFacture(this);
    }

    public void clearLignes() {
        this.lignes.forEach(l -> l.setFacture(null));
        this.lignes.clear();
    }

    public void addPaiement(Paiement paiement) {
        this.paiements.add(paiement);
        paiement.setFacture(this);
    }

    // Recalcule le montant payé et met à jour le statut
    public void recalculerStatut() {
        this.montantPaye = this.paiements.stream()
                .map(Paiement::getMontant)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int cmp = this.montantPaye.compareTo(this.montantTotal);
        if (this.statut == StatutFacture.ANNULEE) return;

        if (this.montantPaye.compareTo(BigDecimal.ZERO) == 0) {
            this.statut = StatutFacture.IMPAYEE;
        } else if (cmp < 0) {
            this.statut = StatutFacture.PARTIELLEMENT_PAYEE;
        } else {
            this.statut = StatutFacture.PAYEE;
        }
    }

    // Recalcule le montant total depuis les lignes
    public void recalculerMontantTotal() {
        this.montantTotal = this.lignes.stream()
                .map(FactureLigne::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}