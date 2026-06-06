package it.solutions.services.trinity.patient.validations;

import it.solutions.services.trinity.core.exception.ValidationException;
import it.solutions.services.trinity.core.shared.enums.GroupeSanguin;
import it.solutions.services.trinity.patient.dao.PatientDao;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientValidator {

    private final PatientDao dao;


    public void validatePhone(UUID patientId, String phone) {
        if (dao.existsByTelephoneAndIdNot(phone, patientId)) {
            throw new ValidationException(
                    "Le numéro de téléphone appartient déjà à un autre patient"
            );
        }
    }

    public void validatePhone(String phone) {
        if (dao.existsByTelephone(phone)) {
            throw new ValidationException(
                    "Le numéro de téléphone appartient déjà à un autre patient"
            );
        }
    }
}
