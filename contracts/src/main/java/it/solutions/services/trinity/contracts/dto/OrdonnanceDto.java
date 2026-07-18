package it.solutions.services.trinity.contracts.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class OrdonnanceDto {

    // ── Request ───────────────────────────────────────────
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {

        @NotNull(message = "La consultation est obligatoire")
        private UUID consultationId;

        @NotNull(message = "Le patient est obligatoire")
        private UUID patientId;

        @NotNull(message = "Le médecin est obligatoire")
        private UUID medecinId;

        private LocalDateTime dateEmission;

        @Min(value = 1, message = "La validité doit être d'au moins 1 jour")
        private Integer validiteJours = 30;

        private String instructions;

        @Valid
        @NotNull(message = "Au moins un médicament est requis")
        private List<MedicamentLigneDto> medicaments;
    }

    // ── Ligne médicament ──────────────────────────────────
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MedicamentLigneDto {

        @NotBlank(message = "Le nom du médicament est obligatoire")
        private String medicamentNom;

        private String dosage;
        private String frequence;
        private String duree;
        private String instructions;
    }

    // ── Response ──────────────────────────────────────────
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {

        private UUID id;
        private UUID consultationId;
        private UUID patientId;
        private String patientNom;
        private UUID medecinId;
        private String medecinNom;
        private LocalDateTime dateEmission;
        private Integer validiteJours;
        private String instructions;
        private String pdfPath;
        private LocalDateTime createdAt;
        private List<MedicamentLigneDto> medicaments;
        private boolean expiree;  // calculé : dateEmission + validiteJours < now
    }
}
