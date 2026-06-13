package it.solutions.services.trinity.agenda.services;

import it.solutions.services.trinity.agenda.dao.AgendaDao;
import it.solutions.services.trinity.agenda.dto.AgendaDto;
import it.solutions.services.trinity.agenda.entities.Agenda;
import it.solutions.services.trinity.agenda.helpers.AgendaHelper;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.entities.UserLight;
import it.solutions.services.trinity.core.shared.enums.Role;
import it.solutions.services.trinity.core.shared.enums.Statut;
import it.solutions.services.trinity.core.shared.enums.StatutRendezVous;
import it.solutions.services.trinity.patient.dto.PatientDto;
import it.solutions.services.trinity.patient.entities.Patient;
import it.solutions.services.trinity.patient.entities.PatientLight;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgendaService {

   private final AgendaDao dao;
    private final AgendaHelper helper;


    public List<AgendaDto.Response> findAgendaByPeriode(String  email, int annee, int mois){

        LocalDateTime debut = LocalDate.of(annee, mois, 1).atStartOfDay().plusMonths(1);
        LocalDateTime fin = debut.plusMonths(1);
        User user=helper.findUserByEmail(email);
        if(user.getRole().equals(Role.ADMIN) || user.getRole().equals(Role.SUPER_ADMIN)){
            return dao.findAgendaByPeriode(debut, fin).stream().map(this::toResponse).toList();
        }
        return dao.findAgendaByPeriode(user.getId(),debut, fin).stream().map(this::toResponse).toList();
    }


    @Transactional
    public AgendaDto.Response create(AgendaDto.Request req) {

        UserLight user=helper.findUserLight(req.getMedecinId(),false);
        PatientLight patient=helper.findPatientLight(req.getPatientId());
        Agenda agenda = Agenda.builder()
                .medecin(user)
                .patient(patient)
                .dateHeure(req.getDateHeure())
                .dureeMinutes(req.getDureeMinutes())
                .motif(req.getMotif())
                .notes(req.getNotes())
                .statut(StatutRendezVous.PLANIFIE)
                .build();
        return toResponse(dao.save(agenda));
    }


    @Transactional
    //@CacheEvict(value = "agendas", key = "#id")
    public AgendaDto.Response edit(UUID id, AgendaDto.Request req) {
        Agenda agenda = dao.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Agenda introuvable : " + id));

        UserLight user=helper.findUserLight(req.getMedecinId(),true);
        PatientLight patient=helper.findPatientLight(req.getPatientId());
        agenda.setMedecin(user);
        agenda.setPatient(patient);
        agenda.setDateHeure(req.getDateHeure());
        agenda.setDureeMinutes(req.getDureeMinutes());
        agenda.setMotif(req.getMotif());
        agenda.setNotes(req.getNotes());
        return toResponse(dao.save(agenda));
    }

    @Transactional
    //@CacheEvict(value = "agendas", key = "#id")
    public AgendaDto.Response changeStatus(UUID id, StatutRendezVous statutRendezVous) {
        Agenda agenda = dao.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Agenda introuvable : " + id));
        agenda.setStatut(statutRendezVous);
        return toResponse(dao.save(agenda));
    }

    @Transactional
    @CacheEvict(value = "agendas", key = "#id")
    public void delete(UUID id) {
        if (!dao.existsById(id)) throw new EntityNotFoundException("Agenda introuvable : " + id);
        dao.deleteById(id);
    }


    private AgendaDto.Response toResponse(Agenda a) {

        PatientLight p=a.getPatient();
        UserLight m=a.getMedecin();
        return AgendaDto.Response.builder()
                .id(a.getId())
                .patientId(p.getId())
                .patientNom(p.getNom())
                .patientPrenom(p.getPrenom())
                .medecinId(m.getId())
                .medecinNom(m.getNom() + " " + m.getPrenom())
                .dateHeure(a.getDateHeure())
                .dureeMinutes(a.getDureeMinutes())
                .motif(a.getMotif())
                .notes(a.getNotes())
                .statut(a.getStatut().name())
                .build();
    }
}
