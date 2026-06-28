package it.solutions.services.trinity.patient.dao;

import it.solutions.services.trinity.contracts.entities.ConsultationLight;
import it.solutions.services.trinity.contracts.entities.PatientLight;
import it.solutions.services.trinity.core.shared.enums.StatutConsultation;
import it.solutions.services.trinity.patient.entities.Consultation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConsultationDao extends JpaRepository<Consultation, UUID> {
    @Query("""
            SELECT new it.solutions.services.trinity.contracts.entities.ConsultationLight(c.id,c.patientId,c.medecinId,c.rendezVousId,c.motif,
                                                                                                                       c.symptomes,c.diagnostic,c.traitement,
                                                                                                                       c.notes)
            FROM Consultation c
            WHERE c.id = :id
            """)
    Optional<ConsultationLight> findConsultationLight(@Param("id") UUID id);

    List<Consultation> findAllByRendezVousIdAndStatutNotIn(UUID rendezVousId,  List<StatutConsultation> statut);

    Page<Consultation> findConsultationsByMedecinIdAndStatutIs(UUID medecinId,StatutConsultation statutConsultation, Pageable pageable);
    Page<Consultation> findConsultationsByStatutIs(StatutConsultation statutConsultation, Pageable pageable);
    Page<Consultation> findConsultationsByPatientId(UUID patientId, Pageable pageable);
}
