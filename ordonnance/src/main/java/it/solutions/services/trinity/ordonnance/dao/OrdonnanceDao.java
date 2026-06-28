package it.solutions.services.trinity.ordonnance.dao;



import it.solutions.services.trinity.ordonnance.entities.Ordonnance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface OrdonnanceDao extends JpaRepository<Ordonnance, UUID> {

    // JOIN FETCH medecin + medicaments pour éviter N+1
    @Query("SELECT o FROM Ordonnance o " +
            "JOIN FETCH o.medecin " +
            "LEFT JOIN FETCH o.medicaments " +
            "WHERE o.id = :id")
    Optional<Ordonnance> findByIdFetch(@Param("id") UUID id);

    @Query("SELECT DISTINCT o FROM Ordonnance o " +
            "JOIN FETCH o.medecin " +
            "JOIN FETCH o.patient p " +
            "LEFT JOIN FETCH o.medicaments " +
            "WHERE p.id = :patientId " +
            "ORDER BY o.dateEmission DESC")
    List<Ordonnance> findByPatientIdFetch(@Param("patientId") UUID patientId);

    @Query("SELECT DISTINCT o FROM Ordonnance o " +
            "JOIN FETCH o.medecin " +
            "JOIN FETCH o.consultation c " +
            "LEFT JOIN FETCH o.medicaments " +
            "WHERE c.id = :consultationId " +
            "ORDER BY o.dateEmission DESC")
    List<Ordonnance> findByConsultationIdFetch(@Param("consultationId") UUID consultationId);

    @Query("SELECT DISTINCT o FROM Ordonnance o " +
            "JOIN FETCH o.medecin " +
            "LEFT JOIN FETCH o.medicaments " +
            "ORDER BY o.dateEmission DESC")
    Page<Ordonnance> findAllFetch(Pageable pageable);
}