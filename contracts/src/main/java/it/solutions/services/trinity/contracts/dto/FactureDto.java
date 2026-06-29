package it.solutions.services.trinity.contracts.dto;


import it.solutions.services.trinity.core.shared.enums.ModePaiement;
import it.solutions.services.trinity.core.shared.enums.StatutFacture;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class FactureDto {

    // ── Request ───────────────────────────────────────────
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {

        @NotNull(message = "Le patient est obligatoire")
        private UUID patientId;

        private UUID consultationId;

        private LocalDateTime dateEmission;

        private String notes;

        @Valid
        @NotEmpty(message = "Au moins une ligne est requise")
        private List<LigneRequest> lignes;
    }

    // ── Ligne facture request ─────────────────────────────
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LigneRequest {

        @NotBlank(message = "La description est obligatoire")
        private String description;

        @Min(value = 1, message = "La quantité doit être au moins 1")
        private Integer quantite = 1;

        @NotNull
        @DecimalMin(value = "0.01", message = "Le prix doit être supérieur à 0")
        private BigDecimal prixUnitaire;
    }

    // ── Request changement statut ─────────────────────────
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class StatutRequest {
        @NotNull
        private StatutFacture statut;
    }

    // ── Response ──────────────────────────────────────────
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {

        private UUID id;
        private UUID patientId;
        private String patientNom;
        private UUID consultationId;
        private String numeroFacture;
        private LocalDateTime dateEmission;
        private BigDecimal montantTotal;
        private BigDecimal montantPaye;
        private BigDecimal resteAPayer;     // calculé : montantTotal - montantPaye
        private String statut;
        private String notes;
        private String pdfPath;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<LigneResponse> lignes;
        private List<PaiementDto.Response> paiements;
    }

    // ── Ligne facture response ────────────────────────────
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LigneResponse {
        private UUID id;
        private String description;
        private Integer quantite;
        private BigDecimal prixUnitaire;
        private BigDecimal total;
    }
}

