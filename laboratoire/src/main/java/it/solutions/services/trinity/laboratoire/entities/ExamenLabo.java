package it.solutions.services.trinity.laboratoire.entities;



import it.solutions.services.trinity.core.shared.entities.BaseEntity;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.enums.StatutExamenLabo;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "examens_labo")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ExamenLabo extends BaseEntity {

    @Column(name = "consultation_id", nullable = false)
    private UUID consultationId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescrit_par", nullable = false)
    private User prescritPar;

    @NotBlank
    @Column(name = "type_examen", nullable = false, length = 150)
    private String typeExamen;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutExamenLabo statut = StatutExamenLabo.EN_ATTENTE;

    @Column(name = "date_prescription")
    private LocalDateTime datePrescription;

    @Column(name = "date_resultat")
    private LocalDateTime dateResultat;
}