package it.solutions.services.trinity.ordonnance.entities;



import it.solutions.services.trinity.core.shared.entities.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "medicaments")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Medicament extends BaseEntity {

    @NotBlank
    @Column(nullable = false, length = 200)
    private String nom;

    @Column(length = 200)
    private String denomination;

    @Column(length = 50)
    private String forme;

    @Column(name = "dosage_unitaire", length = 50)
    private String dosageUnitaire;

    @Min(0)
    @Column(name = "stock_actuel", nullable = false)
    private Integer stockActuel = 0;

    @Min(0)
    @Column(name = "stock_minimum", nullable = false)
    private Integer stockMinimum = 10;

    @Column(name = "prix_unitaire", precision = 10, scale = 2)
    private BigDecimal prixUnitaire;

    @Column(length = 150)
    private String fournisseur;

    @Column(name = "date_expiration")
    private LocalDate dateExpiration;

    @Column(nullable = false)
    private boolean actif = true;

    // Helper — vrai si le stock est sous le minimum
    @Transient
    public boolean isStockBas() {
        return this.stockActuel <= this.stockMinimum;
    }

    // Helper — vrai si le médicament est expiré
    @Transient
    public boolean isExpire() {
        return this.dateExpiration != null && this.dateExpiration.isBefore(LocalDate.now());
    }
}