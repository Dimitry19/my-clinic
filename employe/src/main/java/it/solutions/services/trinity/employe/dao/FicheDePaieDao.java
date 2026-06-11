package it.solutions.services.trinity.employe.dao;

import it.solutions.services.trinity.employe.entities.Employe;
import it.solutions.services.trinity.employe.entities.FicheDePaie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FicheDePaieDao extends JpaRepository<FicheDePaie, UUID> {


    List<FicheDePaie> findFicheDePaieByEmploye(Employe employe);
}
