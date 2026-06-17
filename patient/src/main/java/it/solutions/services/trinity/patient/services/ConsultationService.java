package it.solutions.services.trinity.patient.services;


import it.solutions.services.trinity.core.shared.dao.UserDao;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.utils.GenericUtils;
import it.solutions.services.trinity.patient.dao.ConsultationDao;
import it.solutions.services.trinity.patient.dao.PatientDao;
import it.solutions.services.trinity.patient.dto.ConsultationDto;
import it.solutions.services.trinity.patient.dto.PatientDto;
import it.solutions.services.trinity.patient.entities.Consultation;
import it.solutions.services.trinity.patient.entities.Patient;
import it.solutions.services.trinity.patient.entities.PatientLight;
import it.solutions.services.trinity.patient.helpers.ConsultationHelper;
import it.solutions.services.trinity.patient.validations.ConsultationValidator;
import it.solutions.services.trinity.patient.validations.PatientValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationDao dao;
    private final ConsultationHelper helper;


    public ConsultationDto.Response create(ConsultationDto.Request req) {
        helper.checkMedecin(req.getMedecinId());
        helper.checkPatient(req.getPatientId());
        Consultation consultation = helper.builder(req);
        return toResponse(dao.save(consultation));
    }


    private ConsultationDto.Response toResponse(Consultation c) {
        return  helper.toResponse(c);
    }
}
