package it.solutions.services.trinity.patient.dao;

import it.solutions.services.trinity.core.shared.enums.StatutConsultation;
import it.solutions.services.trinity.patient.entities.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ConsultationDao extends JpaRepository<Consultation, UUID> {
    Consultation findConsultationByRendezVousId(UUID rendezVousId);

    List<Consultation> findAllByRendezVousIdAndStatutNotIn(UUID rendezVousId,  List<StatutConsultation> statut);
}
