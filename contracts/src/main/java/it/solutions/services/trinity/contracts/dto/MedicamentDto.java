package it.solutions.services.trinity.contracts.dto;

import it.solutions.services.trinity.core.shared.enums.StatutStock;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class MedicamentDto {
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank
        private String nom;
        private String denomination;
        private String forme;
        private String dosageUnitaire;
        @Min(value = 0, message = "Stock non négatif")
        private Integer stockActuel;
        @Min(value = 0, message = "Stock minimum non négatif")
        private Integer stockMinimum;
        @DecimalMin(value = "0.0", message = "Prix non négatif")
        private BigDecimal prixUnitaire;
        private String fournisseur;
        private LocalDate dateExpiration;
        private boolean actif = true;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private java.util.UUID id;
        private String nom;
        private String denomination;
        private String forme;
        private String dosageUnitaire;
        private Integer stockActuel;
        private Integer stockMinimum;
        private BigDecimal prixUnitaire;

        private String fournisseur;
        private LocalDate dateExpiration;
        private boolean actif;
        private boolean stockBas;
        private boolean expire;
        private StatutStock statutStock;
        private boolean      expireBientot;
        private Integer      manquant;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class MouvementRequest {
        @NotNull
        private UUID medicamentId;
        @NotNull private Integer quantite;        // positif = entrée, négatif = sortie
        @NotBlank private String motif;           // RECEPTION, DISPENSATION, RETOUR, AJUSTEMENT
        private String           reference;       // n° bon, n° ordonnance...
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class StockStats {
        private long totalMedicaments;
        private long disponibles;
        private long alertes;
        private long ruptures;
        private long expires;
        private long expireBientot;
    }
}
