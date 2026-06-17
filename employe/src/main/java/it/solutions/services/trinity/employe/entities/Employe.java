package it.solutions.services.trinity.employe.entities;

import it.solutions.services.trinity.core.shared.entities.BaseEntity;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.enums.Departement;
import it.solutions.services.trinity.core.shared.enums.TypeContrat;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Employe extends BaseEntity {

    // FetchType.LAZY conservé, mais cascade restreint : on ne veut PAS
    // qu'une suppression d'Employe entraîne la suppression du User.
    // PERSIST/MERGE suffisent pour la création/édition.
    @OneToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "utilisateur_id", unique = true)
    private User utilisateur;

    @NotBlank
    @Column(nullable = false)
    private String nom;

    @NotBlank
    @Column(nullable = false)
    private String prenom;

    @NotBlank
    @Column(nullable = false)
    private String poste;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Departement departement;

    private String telephone;

    @Email
    private String email;

    @Column(nullable = false)
    private LocalDate dateEmbauche;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal salaireBase = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeContrat typeContrat;

    private String numeroCnss;
    private String rib;

    @Column(nullable = false)
    private boolean actif;

    @Builder.Default
    @OneToMany(mappedBy = "employe", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<FicheDePaie> fichesDePaie = new ArrayList<>();
}