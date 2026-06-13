package it.solutions.services.trinity.patient.dto;

import it.solutions.services.trinity.core.shared.enums.Genre;
import it.solutions.services.trinity.core.shared.enums.GroupeSanguin;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class ConsultationDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {

        @NotBlank(message = "Id patient est obligatoire")
        private UUID patientId;

        @NotBlank(message = "Id medecin est obligatoire")
        private UUID medecinId;

        @NotBlank(message = "Id rendez vous est obligatoire")
        private UUID rendezVousId;

        @NotNull(message = "Date et heures sont obligatoires")
        private LocalDateTime dateHeure;

        private String motif;
        private String symptomes;
        private String diagnostic;
        private String traitement;
        private String tension;

        private BigDecimal temperature;
        private BigDecimal poids;
        private BigDecimal taille;
        private String notes;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private UUID id;
        private String nom;
        private String prenom;
        private LocalDate dateNaissance;
        private String sexe;
        private String telephone;
        private String email;
        private String adresse;
        private String groupeSanguin;
        private String allergies;
        private String antecedents;
        private String mutuelle;
        private String numeroMutuelle;
        private String contactUrgenceNom;
        private String contactUrgenceTel;
        private String notesGenerales;
        private int age;
    }
}
