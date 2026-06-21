package it.solutions.services.trinity.agenda.services;

import it.solutions.services.trinity.agenda.dao.AgendaDao;
import it.solutions.services.trinity.agenda.entities.Agenda;
import it.solutions.services.trinity.agenda.helpers.AgendaHelper;
import it.solutions.services.trinity.contracts.dto.AgendaDto;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.entities.UserLight;
import it.solutions.services.trinity.core.shared.enums.Role;
import it.solutions.services.trinity.core.shared.enums.StatutRendezVous;
import it.solutions.services.trinity.core.shared.events.agenda.AgendaStatusChangedEvent;
import it.solutions.services.trinity.core.shared.utils.GenericUtils;
import it.solutions.services.trinity.contracts.entities.PatientLight;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
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
    private final ApplicationEventPublisher publisher;


    public List<AgendaDto.Response> findAgendaToday(String email) {
        return findAgendaByPlage(
                helper.findUserByEmail(email),
                LocalDate.now().atStartOfDay(),
                LocalDate.now().plusDays(1).atStartOfDay()
        );
    }

    public List<AgendaDto.Response> findAgendaByPeriode(String email, int annee, int mois) {
        LocalDateTime debut = LocalDate.of(annee, mois, 1).atStartOfDay().plusMonths(1);
        return findAgendaByPlage(
                helper.findUserByEmail(email),
                debut,
                debut.plusMonths(1)
        );
    }

    @Transactional(readOnly = true)
    public List<AgendaDto.Response> findAgendaByDoctorAndPatient(UUID medecinId,UUID patientId, int annee, int mois){

        LocalDateTime debut = LocalDate.of(annee, mois, 1).atStartOfDay().plusMonths(1);
        LocalDateTime fin = debut.plusMonths(1);
        return dao.findAgendaByDoctorAndPatient(medecinId,patientId,debut, fin).stream().map(helper::toResponse).toList();
    }


    @Transactional
    public AgendaDto.Response create(AgendaDto.Request req) {

        helper.validDate(req.getDateHeure());
        UserLight user=helper.findUserLight(req.getMedecinId());
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
        return helper.toResponse(dao.save(agenda));
    }


    @Transactional
    //@CacheEvict(value = "agendas", key = "#id")
    public AgendaDto.Response edit(UUID id, AgendaDto.Request req) {
        Agenda agenda = dao.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Agenda introuvable : " + id));

        UserLight user=helper.findUserLight(req.getMedecinId());
        PatientLight patient=helper.findPatientLight(req.getPatientId());
        agenda.setMedecin(user);
        agenda.setPatient(patient);
        agenda.setDateHeure(req.getDateHeure());
        agenda.setDureeMinutes(req.getDureeMinutes());
        agenda.setMotif(req.getMotif());
        agenda.setNotes(req.getNotes());
        return helper.toResponse(dao.save(agenda));
    }

    @Transactional
    //@CacheEvict(value = "agendas", key = "#id")
    public AgendaDto.Response changeStatus(UUID id, AgendaDto.StatusRequest statut) {
        Agenda agenda = dao.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Agenda introuvable : " + id));
        agenda.setStatut(statut.getStatut());
        publisher.publishEvent(new AgendaStatusChangedEvent(
                agenda.getId(),
                statut.getStatut()
        ));
        return helper.toResponse(dao.save(agenda));
    }

    @Transactional
    @CacheEvict(value = "agendas", key = "#id")
    public void delete(UUID id) {
        if (!dao.existsById(id)) throw new EntityNotFoundException("Agenda introuvable : " + id);
        dao.deleteById(id);
    }

    @Transactional
    public void marquerRendezVousAReassigner(UUID medecinId) {
        List<Agenda> agendas = dao.findAllByMedecinAndDateHeureAfterAndStatutNotIn(medecinId, LocalDateTime.now(), List.of(StatutRendezVous.ANNULE, StatutRendezVous.TERMINE));
        if (agendas.isEmpty()) {
            return;
        }
        agendas.forEach(a -> a.setStatut(StatutRendezVous.A_REASSIGNER));
        dao.saveAll(agendas);

        agendas.forEach(a -> publisher.publishEvent(new AgendaStatusChangedEvent(a.getId(), StatutRendezVous.A_REASSIGNER)));
    }

    private List<AgendaDto.Response> findAgendaByPlage(User user, LocalDateTime debut, LocalDateTime fin) {
        return (helper.isAdmin(user)
                ? dao.findAgendaByPeriode(debut, fin)
                : dao.findAgendaByDoctor(user.getId(), debut, fin))
                .stream()
                .map(helper::toResponse)
                .toList();
    }
}
