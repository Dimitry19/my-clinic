package it.solutions.services.trinity.employe.dto;


import it.solutions.services.trinity.core.shared.enums.*;
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
import java.util.UUID;

public class EmployeDto {


    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class StatusRequest {
        private String statut;
    }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Le nom est obligatoire")
        private String nom;
        @NotBlank(message = "Le prénom est obligatoire")
        private String prenom;
        @NotBlank(message = "Le poste est obligatoire")
        private String poste;
        @Enumerated(EnumType.STRING)
        private Departement departement;
        private String telephone;
        private String adresse;
        @Email
        private String email;
        @NotNull(message = "La date d'embauche est obligatoire")
        private LocalDate dateEmbauche;
        private BigDecimal salaireBase;
        @Enumerated(EnumType.STRING)
        private TypeContrat typeContrat;
        private String numeroCnss;
        private String rib;
        @Enumerated(EnumType.STRING)
        private StatutEmploye statut;

        @Enumerated(EnumType.STRING)
        private Role role;

    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private UUID id;
        private UUID utilisateurId;
        private String nom;
        private String prenom;
        private String poste;
        private String departement;
        private String telephone;
        private String email;
        private LocalDate dateEmbauche;
        private BigDecimal salaireBase;
        private String typeContrat;
        private String numeroCnss;
        private String rib;
        private String statut;
        private String role;
    }
}
