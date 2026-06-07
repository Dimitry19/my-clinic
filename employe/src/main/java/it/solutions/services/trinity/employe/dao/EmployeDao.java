package it.solutions.services.trinity.employe.dao;


import it.solutions.services.trinity.employe.entities.Employe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmployeDao extends JpaRepository<Employe, UUID> {

    Page<Employe> findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(
            String nom, String prenom, Pageable pageable);

    boolean existsByEmailAndIdNot(String email, UUID id);

    Optional<Employe> findByTelephone(String telephone);
    boolean existsByTelephone(String telephone);
}
