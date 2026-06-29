package it.solutions.services.trinity.facturation.entities;

import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.enums.ModePaiement;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "paiements")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facture_id", nullable = false)
    private Facture facture;

    @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
    @NotNull
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montant;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "mode_paiement", nullable = false, length = 30)
    private ModePaiement modePaiement;

    @Column(length = 100)
    private String reference;

    @Column(name = "date_paiement", nullable = false)
    private LocalDateTime datePaiement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encaisse_par")
    private User encaissePar;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt    = LocalDateTime.now();
        this.datePaiement = this.datePaiement != null ? this.datePaiement : LocalDateTime.now();
    }
}