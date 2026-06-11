package it.solutions.services.trinity.employe.entities;

import it.solutions.services.trinity.core.shared.entities.BaseEntity;
import it.solutions.services.trinity.core.shared.entities.UserLight;
import it.solutions.services.trinity.core.shared.enums.StatutConge;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;


@Entity
@Table(name = "conges")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conge extends BaseEntity {


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id", nullable = false)
    private Employe employe;

    @Column(nullable = false)
    private String typeConge;

    @Column(nullable = false)
    private LocalDate dateDebut;

    @Column
    private String motif;

    @Column(nullable = false)
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutConge statut;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approuve_par", nullable = false)
    private UserLight user;
}