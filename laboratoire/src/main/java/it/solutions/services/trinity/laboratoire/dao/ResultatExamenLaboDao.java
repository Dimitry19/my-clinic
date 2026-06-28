package it.solutions.services.trinity.laboratoire.dao;


import it.solutions.services.trinity.core.shared.entities.UserLight;
import it.solutions.services.trinity.laboratoire.entities.ExamenLabo;
import it.solutions.services.trinity.laboratoire.entities.ResultatExamenLabo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface ResultatExamenLaboDao extends JpaRepository<ResultatExamenLabo, UUID> {


    @Query("SELECT e FROM ResultatExamenLabo e  " +
            "WHERE e.examen = :examen "  )
     ResultatExamenLabo findByExamen(ExamenLabo examen);

    @Query("SELECT e FROM ResultatExamenLabo e JOIN FETCH e.examen " +
            "WHERE e.laborantin = :laborantin ")
    List<ResultatExamenLabo> findByLaborantin(UserLight laborantin);

    @Query("SELECT e FROM ResultatExamenLabo e JOIN FETCH e.examen WHERE e.id = :id")
    Optional<ResultatExamenLabo> findByIdFetch(@Param("id") UUID id);


}