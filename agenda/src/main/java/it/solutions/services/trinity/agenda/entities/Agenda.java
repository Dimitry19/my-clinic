package it.solutions.services.trinity.agenda.entities;


import it.solutions.services.trinity.core.shared.entities.BaseEntity;
import it.solutions.services.trinity.core.shared.entities.UserLight;
import it.solutions.services.trinity.core.shared.enums.StatutRendezVous;
import it.solutions.services.trinity.contracts.entities.PatientLight;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rendez_vous")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Agenda extends BaseEntity {


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientLight patient;


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id", nullable = false)
    private UserLight medecin;


    @Column(nullable = false)
    private LocalDateTime dateHeure;

    @Column(nullable = false)
    private Integer dureeMinutes;

    @Column(columnDefinition = "TEXT")
    private String motif;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutRendezVous statut;

    @Column(columnDefinition = "TEXT")
    private String notes;
    private boolean rappelEnvoye;

}