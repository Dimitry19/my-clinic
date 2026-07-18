package it.solutions.services.trinity.pharmacie.dao;

import it.solutions.services.trinity.pharmacie.entities.Medicament;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface MedicamentDao extends JpaRepository<Medicament, UUID> {
    @Query("""
        SELECT m FROM Medicament m
        WHERE (:search IS NULL OR
               LOWER(m.nom)          LIKE LOWER(CONCAT('%',:search,'%')) OR
               LOWER(m.denomination) LIKE LOWER(CONCAT('%',:search,'%')) OR
               LOWER(m.fournisseur)  LIKE LOWER(CONCAT('%',:search,'%')))
          AND (:actif IS NULL OR m.actif = :actif)
        """)
    Page<Medicament> search(
            @Param("search") String search,
            @Param("actif")  Boolean actif,
            Pageable pageable
    );

    // Médicaments en alerte de stock
    @Query("SELECT m FROM Medicament m WHERE m.actif = true AND m.stockActuel <= m.stockMinimum AND m.stockActuel > 0")
    List<Medicament> findEnAlerte();

    // Médicaments en rupture
    @Query("SELECT m FROM Medicament m WHERE m.actif = true AND m.stockActuel <= 0")
    List<Medicament> findEnRupture();

    // Médicaments expirés ou expirant bientôt
    @Query("SELECT m FROM Medicament m WHERE m.actif = true AND m.dateExpiration <= :dateLimite")
    List<Medicament> findExpirantAvant(@Param("dateLimite") LocalDate dateLimite);

    // Stats rapides
    long countByActifTrue();
    long countByActifTrueAndStockActuelLessThanEqual(Integer seuil);

    @Query("SELECT COUNT(m) FROM Medicament m WHERE m.actif = true AND m.stockActuel > m.stockMinimum")
    long countDisponibles();

    @Query("SELECT COUNT(m) FROM Medicament m WHERE m.actif = true AND m.stockActuel <= 0")
    long countRuptures();

    @Query("SELECT COUNT(m) FROM Medicament m WHERE m.actif = true AND m.stockActuel > 0 AND m.stockActuel <= m.stockMinimum")
    long countAlertes();

    @Query("SELECT COUNT(m) FROM Medicament m WHERE m.actif = true AND m.dateExpiration < CURRENT_DATE")
    long countExpires();

    @Query("SELECT COUNT(m) FROM Medicament m WHERE m.actif = true AND m.dateExpiration BETWEEN CURRENT_DATE AND :limite")
    long countExpirantBientot(@Param("limite") LocalDate limite);
}
