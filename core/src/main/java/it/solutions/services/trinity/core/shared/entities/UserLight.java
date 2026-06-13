package it.solutions.services.trinity.core.shared.entities;


import it.solutions.services.trinity.core.shared.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;
import org.hibernate.annotations.Immutable;

import java.util.UUID;

@Entity
@Table(name = "utilisateurs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@Immutable
public class UserLight {


    public UserLight(
            UUID id,
            String email,
            String nom,
            String prenom,
            Role role
    ) {
        this.setId(id);
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.role = role;
    }

    @Id
    private UUID id;

    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;


}