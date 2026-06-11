package it.solutions.services.trinity.employe.dao;

import it.solutions.services.trinity.employe.entities.Conge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CongeDao extends JpaRepository<Conge, UUID> {

    @Query("SELECT c FROM Conge c JOIN FETCH c.user WHERE c.employe.id = :employeId")
    List<Conge> findCongeByEmploye(@Param("employeId") UUID employeId);
}
