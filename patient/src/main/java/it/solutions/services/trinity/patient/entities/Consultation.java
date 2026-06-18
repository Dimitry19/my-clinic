package it.solutions.services.trinity.patient.entities;


import it.solutions.services.trinity.core.shared.entities.BaseEntity;
import it.solutions.services.trinity.core.shared.enums.StatutConsultation;
import it.solutions.services.trinity.core.shared.enums.TypeConsultation;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "consultations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Consultation extends BaseEntity {


    @Column(nullable = false)
    private UUID patientId;

    @Column(nullable = false)
    private UUID medecinId;

    @Column(nullable = false)
    private UUID rendezVousId;

    @Enumerated(value = EnumType.STRING)
    @Column(nullable = false)
    private TypeConsultation type;

    @Enumerated(value = EnumType.STRING)
    @Column(nullable = false)
    private StatutConsultation statut;

    @Column(columnDefinition = "TEXT")
    private String motif;

    @Column(columnDefinition = "TEXT")
    private String symptomes;

    @Column(columnDefinition = "TEXT")
    private String diagnostic;

    @Column(columnDefinition = "TEXT")
    private String traitement;

    @Column(length =20)
    private String tension;

    @Column( precision = 4, scale = 1)
    private BigDecimal temperature ;

    @Column( precision = 5, scale = 2)
    private BigDecimal poids ;

    @Column(precision = 5, scale = 2)
    private BigDecimal taille;

    @Column(columnDefinition = "TEXT")
    private String notes;
    @Column
    private Integer dureeMinutes;

}
