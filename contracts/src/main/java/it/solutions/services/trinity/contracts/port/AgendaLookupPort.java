package it.solutions.services.trinity.contracts.port;

import it.solutions.services.trinity.contracts.dto.AgendaDto;
import it.solutions.services.trinity.contracts.dto.PatientDto;
import it.solutions.services.trinity.contracts.entities.PatientLight;

import java.util.UUID;

public interface AgendaLookupPort {

    AgendaDto.Response findById(UUID id);

}