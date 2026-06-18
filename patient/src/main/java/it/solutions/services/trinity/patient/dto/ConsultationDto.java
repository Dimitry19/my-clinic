package it.solutions.services.trinity.patient.dto;

import it.solutions.services.trinity.core.shared.enums.StatutConsultation;
import it.solutions.services.trinity.core.shared.enums.TypeConsultation;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

import java.time.LocalDateTime;
import java.util.UUID;

public class ConsultationDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {

        @NotNull(message = "Id patient est obligatoire")
        private UUID patientId;

        @NotNull(message = "Id médecin est obligatoire")
        private UUID medecinId;

        @NotNull(message = "Id rendez vous est obligatoire")
        private UUID rendezVousId;

        private LocalDateTime dateHeure;

        @Enumerated(value = EnumType.STRING)
        private TypeConsultation type;

        @Enumerated(value = EnumType.STRING)
        private StatutConsultation statut;

        private String motif;
        private String symptomes;
        private String diagnostic;
        private String traitement;
        private String tension;

        private BigDecimal temperature;
        private BigDecimal poids;
        private BigDecimal taille;
        private String notes;
        private Integer dureeMinutes;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private UUID id;
        private UUID patientId;
        private UUID medecinId;
        private UUID rendezVousId;
        private String patientNom;
        private String patientPrenom;
        private String medecinNom;
        private LocalDateTime  dateHeure;
        private String type;
        private String statut;
        private String motif;
        private String symptomes;
        private String diagnostic;
        private String traitement;
        private String tension;
        private BigDecimal temperature;
        private BigDecimal poids;
        private BigDecimal taille;
        private String notes;
        private Integer dureeMinutes;
    }

    public static class ResponseLight {
        private UUID id;
        private UUID patientId;
        private UUID medecinId;
        private String medecinNom;
        private LocalDateTime  dateHeure;
        private String statut;
        private String motif;
        private String diagnostic;
        private Integer dureeMinutes;
    }
}
