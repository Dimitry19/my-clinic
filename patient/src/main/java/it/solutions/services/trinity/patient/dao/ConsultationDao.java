package it.solutions.services.trinity.patient.dao;

import it.solutions.services.trinity.core.shared.enums.StatutConsultation;
import it.solutions.services.trinity.patient.entities.Consultation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ConsultationDao extends JpaRepository<Consultation, UUID> {
    Consultation findConsultationByRendezVousId(UUID rendezVousId);

    List<Consultation> findAllByRendezVousIdAndStatutNotIn(UUID rendezVousId,  List<StatutConsultation> statut);

    Page<Consultation> findConsultationsByMedecinIdAndStatutIs(UUID medecinId,StatutConsultation statutConsultation, Pageable pageable);
    Page<Consultation> findConsultationsByStatutIs(StatutConsultation statutConsultation, Pageable pageable);
    Page<Consultation> findConsultationsByPatientId(UUID patientId, Pageable pageable);
}
