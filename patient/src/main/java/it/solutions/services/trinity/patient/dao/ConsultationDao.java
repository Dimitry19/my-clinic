package it.solutions.services.trinity.patient.dao;

import it.solutions.services.trinity.patient.entities.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ConsultationDao extends JpaRepository<Consultation, UUID> {
}
