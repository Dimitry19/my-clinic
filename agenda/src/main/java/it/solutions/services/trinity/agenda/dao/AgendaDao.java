package it.solutions.services.trinity.agenda.dao;

import it.solutions.services.trinity.agenda.entities.Agenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AgendaDao extends JpaRepository<Agenda,UUID> {


    @Query("SELECT a FROM Agenda a JOIN FETCH a.patient p  LEFT JOIN FETCH a.medecin m  WHERE (m.id = :medecinId OR a.medecin IS NULL) AND a.dateHeure >= :debut AND a.dateHeure < :fin")
    List<Agenda> findAgendaByPeriode(@Param("medecinId") UUID medecinId,@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("SELECT a FROM Agenda a    JOIN FETCH a.medecin m  JOIN FETCH a.patient p  WHERE   a.dateHeure >= :debut AND a.dateHeure < :fin")
    List<Agenda> findAgendaByPeriode( @Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);
}
