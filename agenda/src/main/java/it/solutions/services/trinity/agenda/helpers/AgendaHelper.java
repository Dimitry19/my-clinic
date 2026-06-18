package it.solutions.services.trinity.agenda.helpers;

import it.solutions.services.trinity.contracts.dto.EmployeDto;
import it.solutions.services.trinity.contracts.port.EmployeLookupPort;
import it.solutions.services.trinity.contracts.port.PatientLookupPort;
import it.solutions.services.trinity.core.shared.dao.UserDao;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.entities.UserLight;
import it.solutions.services.trinity.contracts.entities.PatientLight;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;


import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AgendaHelper {

    private final UserDao userDao;
    private final PatientLookupPort patientLookupPort;
    private final EmployeLookupPort employeLookupPort;


    public PatientLight findPatientLight(UUID patientId){
         return patientLookupPort.findPatientLight(patientId);

    }
    public UserLight findUserLight(UUID medecinId, boolean isEdit){
        UUID utilisateurId=medecinId;
        if(!isEdit){
            EmployeDto.Response employe=employeLookupPort.findById(medecinId);
            utilisateurId=employe.getId();
        }

         return userDao.findUserLight(utilisateurId).orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable " ));

    }

    public User findUserByEmail(String  email){
        return userDao.findByEmail(email).orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable " ));
    }
}
