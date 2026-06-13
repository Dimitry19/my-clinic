package it.solutions.services.trinity.agenda.validator;

import it.solutions.services.trinity.core.exception.ValidationException;
import it.solutions.services.trinity.patient.dao.PatientDao;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgendaValidator {

    private final PatientDao dao;


    public void existsPatient(UUID patientId) {
        dao.findById(patientId).orElseThrow( ()-> new EntityNotFoundException("Patient introuvable"));
    }
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
