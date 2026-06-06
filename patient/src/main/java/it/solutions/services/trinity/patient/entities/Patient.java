package it.solutions.services.trinity.patient.entities;

import it.solutions.services.trinity.core.shared.entities.BaseEntity;
import it.solutions.services.trinity.core.shared.enums.Genre;
import it.solutions.services.trinity.core.shared.enums.GroupeSanguin;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "patients")
@Getter
@Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Patient extends BaseEntity {

    @NotBlank @Column(nullable = false)
    private String nom;

    @NotBlank
    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false)
    private LocalDate dateNaissance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Genre sexe;

    @Column(unique = true)
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

    @Column(columnDefinition = "TEXT")
    private String notesGenerales;
}