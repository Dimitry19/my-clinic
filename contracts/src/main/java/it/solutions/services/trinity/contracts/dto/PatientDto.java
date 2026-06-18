package it.solutions.services.trinity.contracts.dto;


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

import java.time.LocalDate;
import java.util.UUID;

public class PatientDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Le nom est obligatoire")
        private String nom;
        @NotBlank(message = "Le prénom est obligatoire")
        private String prenom;
        @NotNull(message = "La date de naissance est obligatoire")
        private LocalDate dateNaissance;

        @Enumerated(EnumType.STRING)
        private Genre sexe;
        private String telephone;
        @Email
        private String email;
        private String adresse;
        @Enumerated(EnumType.STRING)
        private GroupeSanguin groupeSanguin;
        private String allergies;
        private String antecedents;
        private String mutuelle;
        private String numeroMutuelle;
        private String contactUrgenceNom;
        private String contactUrgenceTel;
        private String notesGenerales;
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
