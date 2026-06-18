package it.solutions.services.trinity.contracts.port;

import it.solutions.services.trinity.contracts.dto.EmployeDto;


import java.util.UUID;

public interface EmployeLookupPort {

    EmployeDto.Response findById(UUID medecinId);
    EmployeDto.Response findEmployeByUtilisateur(UUID medecinId);
}