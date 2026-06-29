package it.solutions.services.trinity.facturation.dao;

import it.solutions.services.trinity.facturation.entities.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.UUID;


public interface PaiementDao extends JpaRepository<Paiement, UUID> {

    @Query("SELECT p FROM Paiement p " +
            "JOIN FETCH p.encaissePar " +
            "WHERE p.facture.id = :factureId " +
            "ORDER BY p.datePaiement DESC")
    List<Paiement> findByFactureIdFetch(@Param("factureId") UUID factureId);
}
