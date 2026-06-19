package it.solutions.services.trinity.contracts.entities;

import it.solutions.services.trinity.core.shared.entities.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
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
            String prenom,LocalDate dateNaissance
    ) {
        this.setId(id);
        this.nom = nom;
        this.prenom = prenom;
        this.dateNaissance = dateNaissance;
    }

    @NotBlank @Column(nullable = false)
    private String nom;

    @NotBlank
    @Column(nullable = false)
    private String prenom;
    @Column(nullable = false)
    private LocalDate dateNaissance;

}