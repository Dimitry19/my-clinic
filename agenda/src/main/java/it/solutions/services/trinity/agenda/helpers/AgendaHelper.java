package it.solutions.services.trinity.agenda.helpers;

import it.solutions.services.trinity.core.shared.dao.UserDao;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.entities.UserLight;
import it.solutions.services.trinity.employe.dao.EmployeDao;
import it.solutions.services.trinity.employe.entities.Employe;
import it.solutions.services.trinity.patient.dao.PatientDao;
import it.solutions.services.trinity.patient.entities.PatientLight;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;


import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AgendaHelper {

    private final PatientDao patientDao;
    private final UserDao userDao;
    private final EmployeDao employeDao;


    public PatientLight findPatientLight(UUID patientId){
         return patientDao.findPatientLight(patientId).orElseThrow(() -> new EntityNotFoundException("Patient introuvable " ));

    }
    public UserLight findUserLight(UUID medecinId, boolean isEdit){
        UUID utilisateurId=medecinId;
        if(!isEdit){
            Employe employe=employeDao.findById(medecinId).orElseThrow(() -> new EntityNotFoundException("Employé introuvable " ));
            utilisateurId=employe.getUtilisateurId();
        }

         return userDao.findUserLight(utilisateurId).orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable " ));

    }

    public User findUserByEmail(String  email){
        return userDao.findByEmail(email).orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable " ));
    }
}
