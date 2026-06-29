package it.solutions.services.trinity.ordonnance.entities;



import it.solutions.services.trinity.contracts.entities.ConsultationLight;
import it.solutions.services.trinity.contracts.entities.PatientLight;
import it.solutions.services.trinity.core.shared.entities.UserLight;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ordonnances")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Ordonnance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id", nullable = false)
    private ConsultationLight consultation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientLight patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id", nullable = false)
    private UserLight medecin;

    @Column(name = "date_emission", nullable = false)
    private LocalDateTime dateEmission;

    @Min(1)
    @Column(name = "validite_jours")
    private Integer validiteJours = 30;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "pdf_path", length = 500)
    private String pdfPath;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Relation avec les médicaments — cascade ALL + orphanRemoval
    // pour que les lignes soient supprimées/mises à jour avec l'ordonnance
    @Builder.Default
    @OneToMany(
            mappedBy = "ordonnance",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<OrdonnanceMedicament> medicaments = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt    = LocalDateTime.now();
        this.dateEmission = this.dateEmission != null ? this.dateEmission : LocalDateTime.now();
    }

    // Helper pour ajouter un médicament et maintenir la relation bidirectionnelle
    public void addMedicament(OrdonnanceMedicament medicament) {
        this.medicaments.add(medicament);
        medicament.setOrdonnance(this);
    }

    public void clearMedicaments() {
        this.medicaments.forEach(m -> m.setOrdonnance(null));
        this.medicaments.clear();
    }
}
