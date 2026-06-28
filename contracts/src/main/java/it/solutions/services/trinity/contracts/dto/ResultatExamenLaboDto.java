package it.solutions.services.trinity.contracts.dto;



import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ResultatExamenLaboDto {

    // ── Request ───────────────────────────────────────────
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {

        @NotNull(message = "L'examen est obligatoire")
        private UUID examenId;

        @NotNull(message = "Le laborantin est obligatoire")
        private UUID laborantinId;

        @Valid
        private List<ParametreResultatDto> parametres;

        private String interpretation;
    }

    // ── Paramètre individuel ──────────────────────────────
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ParametreResultatDto {

        @NotBlank(message = "Le libellé du paramètre est obligatoire")
        private String libelle;

        @NotBlank(message = "La valeur est obligatoire")
        private String valeur;

        private String unite;
        private String norme;
        private boolean anormal;
    }

    // ── Response ──────────────────────────────────────────
    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {

        private UUID id;
        private UUID examenId;
        private UUID laborantinId;
        private String laborantinNom;
        private List<ParametreResultatDto> parametres;
        private String interpretation;
        private String pdfPath;
        private LocalDateTime createdAt;
    }
}