package it.solutions.services.trinity.agenda.validator;

import it.solutions.services.trinity.contracts.port.PatientLookupPort;
import it.solutions.services.trinity.core.exception.ValidationException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgendaValidator {


    private final PatientLookupPort patientLookupPort;


    public void existsPatient(UUID patientId) {
        patientLookupPort.findById(patientId);
    }
    public void validatePhone(UUID patientId, String phone) {
        patientLookupPort.validatePhone(patientId,phone);
    }

    public void validatePhone(String phone) {
        patientLookupPort.validatePhone(phone);

    }
}
