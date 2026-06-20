package it.solutions.services.trinity.laboratoire.dao;


import it.solutions.services.trinity.core.shared.enums.StatutExamenLabo;

import it.solutions.services.trinity.laboratoire.entities.ExamenLabo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface ExamenLaboDao extends JpaRepository<ExamenLabo, UUID> {

    // Fetch JOIN pour éviter le N+1 sur prescritPar
    @Query("SELECT e FROM ExamenLabo e JOIN FETCH e.prescritPar " +
            "WHERE e.patientId = :patientId " +
            "ORDER BY e.datePrescription DESC")
    Page<ExamenLabo> findByPatientId(@Param("patientId") UUID patientId, Pageable pageable);

    @Query("SELECT e FROM ExamenLabo e JOIN FETCH e.prescritPar " +
            "WHERE e.consultationId = :consultationId " +
            "ORDER BY e.datePrescription DESC")
    List<ExamenLabo> findByConsultationId(@Param("consultationId") UUID consultationId);

    @Query("SELECT e FROM ExamenLabo e JOIN FETCH e.prescritPar WHERE e.id = :id")
    Optional<ExamenLabo> findByIdFetch(@Param("id") UUID id);

    long countByPatientIdAndStatut(UUID patientId, StatutExamenLabo statut);
}