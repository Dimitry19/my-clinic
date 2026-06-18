package it.solutions.services.trinity.patient.services;


import it.solutions.services.trinity.contracts.dto.EmployeDto;
import it.solutions.services.trinity.contracts.dto.PatientDto;
import it.solutions.services.trinity.core.shared.enums.StatutConsultation;
import it.solutions.services.trinity.patient.dao.ConsultationDao;
import it.solutions.services.trinity.patient.dto.ConsultationDto;
import it.solutions.services.trinity.patient.entities.Consultation;
import it.solutions.services.trinity.patient.helpers.ConsultationHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConsultationService {
    private static final Sort SORT_BY_STATUT = Sort.by("statut").ascending();
    private final ConsultationDao dao;
    private final ConsultationHelper helper;


    public ConsultationDto.Response create(ConsultationDto.Request req) {
        EmployeDto.Response emp=helper.checkMedecin(req.getMedecinId());
        helper.checkPatient(req.getPatientId());
        req.setMedecinId(emp.getUtilisateurId());
        Consultation consultation = helper.builder(req);
        return helper.toResponse(dao.save(consultation));
    }



    public Page<ConsultationDto.Response> findAllByPatient(UUID id, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, SORT_BY_STATUT);
        return dao.findConsultationsByPatientId(
                id, pageable).map(helper::toResponse);
    }


    public void marquerConsultationAPlanifier(UUID rendezVousId) {

        List<Consultation> consultations = dao.findAllByRendezVousIdAndStatutNotIn(rendezVousId,List.of(StatutConsultation.ANNULEE, StatutConsultation.TERMINEE));
        if (consultations.isEmpty()) {
            return;
        }
        consultations.forEach(a -> a.setStatut(StatutConsultation.PLANIFIEE));
        dao.saveAll(consultations);
    }





}
