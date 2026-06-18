package it.solutions.services.trinity.contracts.port;

import   it.solutions.services.trinity.contracts.dto.PatientDto;
import it.solutions.services.trinity.contracts.entities.PatientLight;

import java.util.UUID;

public interface PatientLookupPort {

    PatientDto.Response findById(UUID patientId);
    PatientLight findPatientLight(UUID patientId);
    void existsPatient(UUID patientId);
    void validatePhone(UUID patientId, String phone);
    void validatePhone(String phone);



}