package it.solutions.services.trinity.patient.services;


import it.solutions.services.trinity.contracts.dto.EmployeDto;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.enums.Role;
import it.solutions.services.trinity.core.shared.enums.StatutConsultation;
import it.solutions.services.trinity.core.shared.events.agenda.AgendaStatusChangedEvent;
import it.solutions.services.trinity.patient.dao.ConsultationDao;
import it.solutions.services.trinity.contracts.dto.ConsultationDto;
import it.solutions.services.trinity.patient.entities.Consultation;
import it.solutions.services.trinity.patient.helpers.ConsultationHelper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConsultationService {
    private static final Sort SORT_BY_STATUT = Sort.by("statut").ascending();
    private final ConsultationDao dao;
    private final ConsultationHelper helper;


    @Transactional(readOnly = true)
    @Cacheable(value = "consultations", key = "#id")
    public ConsultationDto.Response findById(UUID id) {
        return helper.toResponse(dao.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Consultation introuvable ")));
    }

    @Transactional
    public ConsultationDto.Response create(ConsultationDto.Request req) {
        EmployeDto.Response emp=helper.checkMedecin(req.getMedecinId());
        helper.checkPatient(req.getPatientId());
        req.setMedecinId(emp.getUtilisateurId());
        Consultation consultation = helper.builder(req);
        return helper.toResponse(dao.save(consultation));
    }

    @Transactional(readOnly = true)
    public Page<ConsultationDto.Response> findAllByStatus(StatutConsultation statutConsultation, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, SORT_BY_STATUT);
        return dao.findConsultationsByStatutIs(
                statutConsultation, pageable).map(helper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ConsultationDto.Response> findAllByStatusAndDoctor(String email,StatutConsultation statutConsultation, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, SORT_BY_STATUT);
        User user=helper.findUserByEmail(email);

        if(helper.isAdmin(user)){
            return dao.findConsultationsByStatutIs(
                    statutConsultation, pageable).map(helper::toResponse);
        }

        UUID medecinId=helper.findEmployeByUtilisateur(user.getId()).getId();
        return dao.findConsultationsByMedecinIdAndStatutIs(medecinId,
                statutConsultation, pageable).map(helper::toResponse);
    }



    @Transactional(readOnly = true)
    public Page<ConsultationDto.Response> findAllByPatient(UUID patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, SORT_BY_STATUT);
        return dao.findConsultationsByPatientId(
                patientId, pageable).map(helper::toResponse);
    }

    @Transactional
    @CacheEvict(value = "consultations", key = "#id")
    public ConsultationDto.Response edit(UUID id, ConsultationDto.Request req) {
        Consultation consultation = dao.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Consultation introuvable"));

        helper.update(consultation ,req);
        return helper.toResponse(dao.save(consultation));
    }

    @Transactional
   // @CacheEvict(value = "consultations", key = "#id")
    public ConsultationDto.Response changeStatus(UUID id, ConsultationDto.StatusRequest statut) {
        Consultation consultation = dao.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Consultation introuvable : " + id));
        consultation.setStatut(statut.getStatut());
        /*publisher.publishEvent(new AgendaStatusChangedEvent(
                agenda.getId(),
                statut.getStatut()
        ));*/
        return helper.toResponse(dao.save(consultation));

    }

    @Transactional
    @CacheEvict(value = "consultations", key = "#id")
    public void delete(UUID id) {
        if (!dao.existsById(id)) {
            throw new jakarta.persistence.EntityNotFoundException("Consultation introuvable : " + id);
        }
        dao.deleteById(id);
    }

    @Transactional
    public void marquerConsultationAPlanifier(UUID rendezVousId) {

        List<Consultation> consultations = dao.findAllByRendezVousIdAndStatutNotIn(rendezVousId,List.of(StatutConsultation.ANNULEE, StatutConsultation.TERMINEE));
        if (consultations.isEmpty()) {
            return;
        }
        consultations.forEach(c -> c.setStatut(StatutConsultation.PLANIFIEE));
        dao.saveAll(consultations);
    }

    private boolean isAdmin(User user) {
        return user.getRole().equals(Role.ADMIN) || user.getRole().equals(Role.SUPER_ADMIN);
    }
}
