package it.solutions.services.trinity.agenda.helpers;

import it.solutions.services.trinity.agenda.entities.Agenda;
import it.solutions.services.trinity.contracts.dto.AgendaDto;
import it.solutions.services.trinity.contracts.dto.EmployeDto;
import it.solutions.services.trinity.contracts.port.EmployeLookupPort;
import it.solutions.services.trinity.contracts.port.PatientLookupPort;
import it.solutions.services.trinity.core.exception.ValidationException;
import it.solutions.services.trinity.core.helpers.CoreHelper;
import it.solutions.services.trinity.core.shared.dao.UserDao;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.entities.UserLight;
import it.solutions.services.trinity.contracts.entities.PatientLight;
import it.solutions.services.trinity.core.shared.utils.GenericUtils;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;


import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class AgendaHelper extends CoreHelper {


    private final PatientLookupPort patientLookupPort;
    private final EmployeLookupPort employeLookupPort;

    public AgendaHelper(UserDao userDao, PatientLookupPort patientLookupPort, EmployeLookupPort employeLookupPort) {
        super(userDao);
        this.patientLookupPort = patientLookupPort;
        this.employeLookupPort = employeLookupPort;
    }


    public PatientLight findPatientLight(UUID patientId){
         return patientLookupPort.findPatientLight(patientId);

    }
    public UserLight findUserLight(UUID medecinId){


         return userDao.findUserLight(medecinId).orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable " ));

    }


    public void validDate(LocalDateTime dateHeure){
        if(!GenericUtils.isFutureDate(dateHeure)){
            throw new ValidationException("Impossible de créer un rendez-vous avec une date antérieure à la date actuelle" );
        }
    }




    public AgendaDto.Response toResponse(Agenda a) {

        PatientLight p=a.getPatient();
        UserLight m=a.getMedecin();
        String nom = GenericUtils.normalizeUpper(m.getNom());
        String prenom = GenericUtils.normalize(m.getPrenom());
        return AgendaDto.Response.builder()
                .id(a.getId())
                .patientId(p.getId())
                .patientNom(p.getNom())
                .patientPrenom(p.getPrenom())
                .medecinId(m.getId())
                .medecinNom(GenericUtils.formatMedecinNom(nom,prenom))
                .dateHeure(a.getDateHeure())
                .dureeMinutes(a.getDureeMinutes())
                .motif(a.getMotif())
                .notes(a.getNotes())
                .statut(a.getStatut().name())
                .build();
    }
}
