package it.solutions.services.trinity.contracts.dto;

import it.solutions.services.trinity.core.shared.enums.StatutExamenLabo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

public class ExamenLaboDto {

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {

        @NotNull(message = "La consultation est obligatoire")
        private UUID consultationId;

        @NotNull(message = "Le patient est obligatoire")
        private UUID patientId;

        @NotNull(message = "Le prescripteur est obligatoire")
        private UUID prescritPar;

        @NotBlank(message = "Le type d'examen est obligatoire")
        private String typeExamen;

        private String description;

        private StatutExamenLabo statut;

        private LocalDateTime datePrescription;
        private LocalDateTime dateResultat;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private UUID id;
        private UUID consultationId;
        private UUID patientId;
        private UUID prescritParId;
        private String prescritParNom;
        private String typeExamen;
        private String description;
        private String statut;
        private LocalDateTime datePrescription;
        private LocalDateTime dateResultat;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class StatusRequest {
        @NotNull
        private StatutExamenLabo statut;
    }
}