package it.solutions.services.trinity.contracts.entities;

import it.solutions.services.trinity.core.shared.entities.BaseEntity;
import it.solutions.services.trinity.core.shared.enums.StatutConsultation;
import it.solutions.services.trinity.core.shared.enums.TypeConsultation;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "consultations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Immutable
public class ConsultationLight extends BaseEntity {


    public ConsultationLight(UUID id,UUID patientId,UUID medecinId,UUID rendezVousId,String motif,
                             String symptomes,String diagnostic,String traitement,
                             String notes) {
        this.setId(id);
        this.patientId=patientId;
        this.medecinId=medecinId;
        this.rendezVousId=rendezVousId;
        this.motif=motif;
        this.symptomes=symptomes;
        this.diagnostic=diagnostic;
        this.traitement=traitement;
        this.notes=notes;
    }

    @Column(nullable = false)
    private UUID patientId;

    @Column(nullable = false)
    private UUID medecinId;

    @Column(nullable = false)
    private UUID rendezVousId;


    @Column(columnDefinition = "TEXT")
    private String motif;

    @Column(columnDefinition = "TEXT")
    private String symptomes;

    @Column(columnDefinition = "TEXT")
    private String diagnostic;

    @Column(columnDefinition = "TEXT")
    private String traitement;

    @Column(columnDefinition = "TEXT")
    private String notes;


}