package it.solutions.services.trinity.facturation.dao;

import it.solutions.services.trinity.core.shared.enums.StatutFacture;
import it.solutions.services.trinity.facturation.entities.Facture;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;



public interface FactureDao extends JpaRepository<Facture, UUID> {

    // ── Pagination sur IDs uniquement ─────────────────────

    @Query("SELECT f.id FROM Facture f ORDER BY f.dateEmission DESC")
    Page<UUID> findAllIds(Pageable pageable);

    @Query("SELECT f.id FROM Facture f WHERE f.statut = :statut ORDER BY f.dateEmission DESC")
    Page<UUID> findIdsByStatut(@Param("statut") StatutFacture statut, Pageable pageable);

    @Query("SELECT f.id FROM Facture f JOIN f.patient p WHERE p.id = :patientId ORDER BY f.dateEmission DESC")
    Page<UUID> findIdsByPatientId(@Param("patientId") UUID patientId, Pageable pageable);

    // ── Chargement en deux passes ─────────────────────────

    @Query("SELECT DISTINCT f FROM Facture f " +
            "JOIN FETCH f.patient " +
            "LEFT JOIN FETCH f.consultation " +
            "LEFT JOIN FETCH f.lignes " +
            "WHERE f.id IN :ids")
    List<Facture> findWithLignesByIds(@Param("ids") List<UUID> ids);

    @Query("SELECT DISTINCT f FROM Facture f " +
            "LEFT JOIN FETCH f.paiements p " +
            "LEFT JOIN FETCH p.encaissePar " +
            "WHERE f.id IN :ids")
    List<Facture> findWithPaiementsByIds(@Param("ids") List<UUID> ids);

    // ── findById en deux passes ───────────────────────────

    @Query("SELECT f FROM Facture f " +
            "JOIN FETCH f.patient " +
            "LEFT JOIN FETCH f.consultation " +
            "LEFT JOIN FETCH f.lignes " +
            "WHERE f.id = :id")
    Optional<Facture> findByIdWithLignes(@Param("id") UUID id);

    @Query("SELECT f FROM Facture f " +
            "LEFT JOIN FETCH f.paiements p " +
            "LEFT JOIN FETCH p.encaissePar " +
            "WHERE f.id = :id")
    Optional<Facture> findByIdWithPaiements(@Param("id") UUID id);

    boolean existsByNumeroFacture(String numeroFacture);
}

