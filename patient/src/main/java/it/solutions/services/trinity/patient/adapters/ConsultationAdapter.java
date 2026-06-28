package it.solutions.services.trinity.patient.adapters;

import it.solutions.services.trinity.contracts.dto.ConsultationDto;
import it.solutions.services.trinity.contracts.dto.PatientDto;
import it.solutions.services.trinity.contracts.entities.ConsultationLight;
import it.solutions.services.trinity.contracts.entities.PatientLight;
import it.solutions.services.trinity.contracts.port.ConsultationLookupPort;
import it.solutions.services.trinity.contracts.port.PatientLookupPort;
import it.solutions.services.trinity.core.exception.ValidationException;
import it.solutions.services.trinity.patient.dao.ConsultationDao;
import it.solutions.services.trinity.patient.dao.PatientDao;
import it.solutions.services.trinity.patient.entities.Consultation;
import it.solutions.services.trinity.patient.entities.Patient;
import it.solutions.services.trinity.patient.helpers.ConsultationHelper;
import it.solutions.services.trinity.patient.helpers.PatientHelper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConsultationAdapter implements ConsultationLookupPort {

    private final ConsultationDao dao;
    private final ConsultationHelper helper;

    @Override
    public ConsultationDto.Response findById(UUID id) {

        Consultation c = dao.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Consultation introuvable " ));

        return helper.toResponse(c);
    }


    public ConsultationLight findConsultationLight(UUID id){
        return dao.findConsultationLight(id).orElseThrow(() -> new EntityNotFoundException("Consultation introuvable " ));

    }

}