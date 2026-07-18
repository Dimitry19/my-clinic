package it.solutions.services.trinity.pharmacie.entities;


import it.solutions.services.trinity.core.shared.entities.BaseEntity;
import it.solutions.services.trinity.core.shared.enums.StatutStock;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "medicaments")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Medicament extends BaseEntity {

    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false, length = 200)
    private String nom;

    @Column(length = 200)
    private String denomination;

    @Column(length = 50)
    private String forme; // comprimé, sirop, injectable, gélule...

    @Column(name = "dosage_unitaire", length = 50)
    private String dosageUnitaire; // 500mg, 250ml...

    @Min(value = 0, message = "Le stock ne peut pas être négatif")
    @Column(name = "stock_actuel", nullable = false)
    private Integer stockActuel = 0;

    @Min(value = 0, message = "Le stock minimum ne peut pas être négatif")
    @Column(name = "stock_minimum", nullable = false)
    private Integer stockMinimum = 10;

    @DecimalMin(value = "0.0", message = "Le prix ne peut pas être négatif")
    @Column(name = "prix_unitaire", precision = 10, scale = 2)
    private BigDecimal prixUnitaire;

    @Column(length = 150)
    private String fournisseur;

    @Column(name = "date_expiration")
    private LocalDate dateExpiration;

    @Column(nullable = false)
    private Boolean actif = true;

    // Computed — non persisté
    @Transient
    public StatutStock getStatutStock() {
        if (stockActuel <= 0)              return StatutStock.RUPTURE;
        if (stockActuel <= stockMinimum)   return StatutStock.ALERTE;
        return StatutStock.DISPONIBLE;
    }

    @Transient
    public boolean isExpire() {
        return dateExpiration != null && dateExpiration.isBefore(LocalDate.now());
    }

    @Transient
    public boolean isExpireBientot() {
        return dateExpiration != null &&
                !isExpire() &&
                dateExpiration.isBefore(LocalDate.now().plusDays(30));
    }


}

