package it.solutions.services.trinity.employe.dao;


 import it.solutions.services.trinity.employe.entities.Employe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface EmployeDao extends JpaRepository<Employe, UUID> {


    @Query("""
    SELECT e
    FROM Employe e
    WHERE (
            LOWER(e.nom) LIKE LOWER(CONCAT('%', :search, '%'))
         OR LOWER(e.prenom) LIKE LOWER(CONCAT('%', :search, '%'))
         OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%'))
          )
      AND LOWER(e.departement) = LOWER(:departement)
""")
    Page<Employe> findByNomOrPrenomOrEmailAndDepartement(
            @Param("search") String search,
            @Param("departement") String departement,
            Pageable pageable);

    Page<Employe> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(
            String nom, String prenom, Pageable pageable);

    boolean existsByEmailAndIdNot(String email, UUID id);

    Optional<Employe> findByTelephone(String telephone);
    boolean existsByTelephone(String telephone);
}
