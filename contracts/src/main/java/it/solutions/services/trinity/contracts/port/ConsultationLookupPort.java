package it.solutions.services.trinity.contracts.port;

import it.solutions.services.trinity.contracts.dto.ConsultationDto;
import it.solutions.services.trinity.contracts.dto.PatientDto;
import it.solutions.services.trinity.contracts.entities.ConsultationLight;
import it.solutions.services.trinity.contracts.entities.PatientLight;

import java.util.UUID;

public interface ConsultationLookupPort {

    ConsultationDto.Response findById(UUID id);
    ConsultationLight findConsultationLight(UUID id);
}