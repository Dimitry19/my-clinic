package it.solutions.services.trinity.facturation.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "facture_lignes")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class FactureLigne {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facture_id", nullable = false)
    private Facture facture;

    @NotBlank
    @Column(nullable = false, length = 300)
    private String description;

    @Min(1)
    @Column(nullable = false)
    private Integer quantite = 1;

    @NotNull
    @Column(name = "prix_unitaire", nullable = false, precision = 10, scale = 2)
    private BigDecimal prixUnitaire;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @PrePersist
    @PreUpdate
    protected void calculerTotal() {
        if (this.prixUnitaire != null && this.quantite != null) {
            this.total = this.prixUnitaire.multiply(BigDecimal.valueOf(this.quantite));
        }
    }
}