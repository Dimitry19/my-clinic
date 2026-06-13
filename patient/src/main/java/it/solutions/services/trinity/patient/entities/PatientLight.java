package it.solutions.services.trinity.patient.entities;

import it.solutions.services.trinity.core.shared.entities.BaseEntity;
import it.solutions.services.trinity.core.shared.enums.Genre;
import it.solutions.services.trinity.core.shared.enums.GroupeSanguin;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.Immutable;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "patients")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Immutable
public class PatientLight extends BaseEntity {


    public PatientLight(
            UUID id,
            String nom,
            String prenom
    ) {
        this.setId(id);
        this.nom = nom;
        this.prenom = prenom;
    }

    @NotBlank @Column(nullable = false)
    private String nom;

    @NotBlank
    @Column(nullable = false)
    private String prenom;

}