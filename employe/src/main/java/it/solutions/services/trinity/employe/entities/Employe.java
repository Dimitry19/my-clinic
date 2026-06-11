package it.solutions.services.trinity.employe.entities;

import it.solutions.services.trinity.core.shared.entities.BaseEntity;
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
import java.util.UUID;

@Entity
@Table(name = "employes")
@Getter
@Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Employe extends BaseEntity {


    @Column(updatable = false)
    private UUID utilisateurId;

    @NotBlank @Column(nullable = false)
    private String nom;

    @NotBlank
    @Column(nullable = false)
    private String prenom;

    @NotBlank
    @Column(nullable = false)
    private String poste;

    @Enumerated(EnumType.STRING)
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
    private boolean actif;


    @OneToMany(mappedBy = "employe")
    private List<FicheDePaie> fichesDePaie = new ArrayList<>();

}