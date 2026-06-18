package it.solutions.services.trinity.patient.services;


import it.solutions.services.trinity.contracts.dto.EmployeDto;
import it.solutions.services.trinity.core.shared.enums.StatutConsultation;
import it.solutions.services.trinity.patient.dao.ConsultationDao;
import it.solutions.services.trinity.patient.dto.ConsultationDto;
import it.solutions.services.trinity.patient.entities.Consultation;
import it.solutions.services.trinity.patient.helpers.ConsultationHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationDao dao;
    private final ConsultationHelper helper;


    public ConsultationDto.Response create(ConsultationDto.Request req) {
        EmployeDto.Response emp=helper.checkMedecin(req.getMedecinId());
        helper.checkPatient(req.getPatientId());
        req.setMedecinId(emp.getUtilisateurId());
        Consultation consultation = helper.builder(req);
        return toResponse(dao.save(consultation));
    }

    public void marquerConsultationAPlanifier(UUID rendezVousId) {

        List<Consultation> consultations = dao.findAllByRendezVousIdAndStatutNotIn(rendezVousId,List.of(StatutConsultation.ANNULEE, StatutConsultation.TERMINEE));
        if (consultations.isEmpty()) {
            return;
        }
        consultations.forEach(a -> a.setStatut(StatutConsultation.PLANIFIEE));
        dao.saveAll(consultations);
    }


    private ConsultationDto.Response toResponse(Consultation c) {
        return  helper.toResponse(c);
    }
}
