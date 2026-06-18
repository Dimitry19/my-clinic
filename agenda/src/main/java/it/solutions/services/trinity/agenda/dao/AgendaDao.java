package it.solutions.services.trinity.agenda.dao;

import it.solutions.services.trinity.agenda.entities.Agenda;
import it.solutions.services.trinity.core.shared.enums.StatutRendezVous;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AgendaDao extends JpaRepository<Agenda,UUID> {


    @Query("SELECT a FROM Agenda a JOIN FETCH a.patient p  LEFT JOIN FETCH a.medecin m  WHERE m.id = :medecinId AND    a.dateHeure >= :debut AND a.dateHeure < :fin")
    List<Agenda> findAgendaByDoctor(@Param("medecinId") UUID medecinId, @Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

   // @Query("SELECT a FROM Agenda a JOIN FETCH a.patient p  LEFT JOIN FETCH a.medecin m  WHERE m.utilisa = :medecinId AND p.id= :patientId AND  a.dateHeure >= :debut AND a.dateHeure < :fin")
   @Query(value = """
    SELECT rv.*
    FROM rendez_vous rv
         JOIN patients p
              ON p.id = rv.patient_id
         LEFT JOIN utilisateurs u
              ON u.id = rv.medecin_id
         LEFT JOIN employes e
              ON e.utilisateur_id = u.id
    WHERE e.id = :medecinId
      AND p.id = :patientId
      AND u.role in ('MEDECIN','INFIRMIER')
        AND rv.date_heure  >= current_date
    """, nativeQuery = true)
   List<Agenda> findAgendaByDoctorAndPatient(@Param("medecinId") UUID medecinId,@Param("patientId") UUID patientId,@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("SELECT a FROM Agenda a    JOIN FETCH a.medecin m  JOIN FETCH a.patient p  WHERE   a.dateHeure >= :debut AND a.dateHeure < :fin")
    List<Agenda> findAgendaByPeriode( @Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);



    List<Agenda> findAllByMedecinAndDateHeureAfterAndStatutNotIn(
            UUID medecinId, LocalDateTime dateHeure, List<StatutRendezVous> statutsExclus);
}
