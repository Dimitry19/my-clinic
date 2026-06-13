package it.solutions.services.trinity.patient.dao;


import java.util.Optional;
import java.util.UUID;

import it.solutions.services.trinity.patient.entities.Patient;

import it.solutions.services.trinity.patient.entities.PatientLight;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PatientDao extends JpaRepository<Patient, UUID> {

    Page<Patient> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(
            String nom, String prenom, Pageable pageable);

    Page<Patient> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrTelephoneContainingIgnoreCase(
            String nom, String prenom,String telephone, Pageable pageable);

    boolean existsByTelephoneAndIdNot(String telephone, UUID id);

    @Query("""
            SELECT new it.solutions.services.trinity.patient.entities.PatientLight(p.id,p.nom,p.prenom )
            FROM Patient p
            WHERE p.id = :id
            """)
    Optional<PatientLight> findPatientLight(@Param("id") UUID id);

    boolean existsByTelephone(String telephone);
}
