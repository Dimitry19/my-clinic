package it.solutions.services.trinity.patient.adapters;

import it.solutions.services.trinity.contracts.dto.PatientDto;
import it.solutions.services.trinity.contracts.entities.PatientLight;
import it.solutions.services.trinity.contracts.port.PatientLookupPort;
import it.solutions.services.trinity.core.exception.ValidationException;
import it.solutions.services.trinity.core.shared.entities.UserLight;
import it.solutions.services.trinity.patient.dao.PatientDao;
import it.solutions.services.trinity.patient.entities.Patient;
import it.solutions.services.trinity.patient.helpers.PatientHelper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientAdapter implements PatientLookupPort {

    private final PatientDao dao;
    private final PatientHelper helper;

    @Override
    public PatientDto.Response findById(UUID medecinId) {

        Patient patient = dao.findById(medecinId)
                .orElseThrow(() -> new EntityNotFoundException("Patient introuvable " ));

        return helper.toResponse(patient);
    }


    public PatientLight findPatientLight(UUID patientId){
        return dao.findPatientLight(patientId).orElseThrow(() -> new EntityNotFoundException("Patient introuvable " ));

    }
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