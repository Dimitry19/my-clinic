package it.solutions.services.trinity.patient.dao;

import java.util.Optional;
import java.util.UUID;

import it.solutions.services.trinity.patient.entities.Patient;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientDao extends JpaRepository<Patient, UUID> {

    Page<Patient> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(
            String nom, String prenom, Pageable pageable);

    Page<Patient> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrTelephoneContainingIgnoreCase(
            String nom, String prenom,String telephone, Pageable pageable);

    boolean existsByTelephoneAndIdNot(String telephone, UUID id);

    Optional<Patient> findByTelephone(String telephone);
    boolean existsByTelephone(String telephone);
}
