package it.solutions.services.trinity.contracts.dto;

import it.solutions.services.trinity.core.shared.enums.ModePaiement;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class PaiementDto {

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {

        @NotNull(message = "La facture est obligatoire")
        private UUID factureId;

        @NotNull
        @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
        private BigDecimal montant;

        @NotNull(message = "Le mode de paiement est obligatoire")
        private ModePaiement modePaiement;

        private String reference;

        private LocalDateTime datePaiement;

        private UUID encaisseParId;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private UUID id;
        private UUID factureId;
        private BigDecimal montant;
        private String modePaiement;
        private String reference;
        private LocalDateTime datePaiement;
        private UUID encaisseParId;
        private String encaisseParNom;
        private LocalDateTime createdAt;
    }
}