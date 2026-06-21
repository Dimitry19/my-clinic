package it.solutions.services.trinity.contracts.entities;


import it.solutions.services.trinity.core.shared.entities.UserLight;
import it.solutions.services.trinity.core.shared.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Immutable;

import java.util.UUID;

@Entity
@Table(name = "employes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@Immutable
public class EmployeLight {


    public EmployeLight(
            UUID id,
            String nom,
            String prenom,
            String poste,
            UserLight utilisateur
    ) {
        this.setId(id);
        this.nom = nom;
        this.prenom = prenom;
        this.poste = poste;
        this.utilisateur = utilisateur;

    }

    @Id
    private UUID id;



    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false)
    private String poste;

    @OneToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "utilisateur_id", unique = true)
    private UserLight utilisateur;



}