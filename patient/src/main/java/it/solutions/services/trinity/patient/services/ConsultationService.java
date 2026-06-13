package it.solutions.services.trinity.patient.services;


import it.solutions.services.trinity.core.shared.dao.UserDao;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.patient.dto.ConsultationDto;
import it.solutions.services.trinity.patient.entities.Consultation;
import it.solutions.services.trinity.patient.validations.ConsultationValidator;
import it.solutions.services.trinity.patient.validations.PatientValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationValidator validator;
    private final PatientValidator patientValidator;
    private final UserDao userDao;


    public ConsultationDto.Response create(ConsultationDto.Request req) {

        User user=userDao.findById(req.getMedecinId()).orElseThrow(()-> new EntityNotFoundException("Médecin introuvable"));
        patientValidator.existsPatient(req.getPatientId());
        //TODO Faire la validation du rendez vous , on y prendrait la date et heure , le motif, les infos du patient et du medecin
        Consultation consultation = Consultation.builder()
                .patientId(req.getPatientId())
                .medecinId(req.getMedecinId())
                .rendezVousId(req.getRendezVousId())
                .dateHeure(req.getDateHeure())
                .motif(req.getMotif())
                .symptomes(req.getSymptomes())
                .diagnostic(req.getDiagnostic())
                .traitement(req.getTraitement())
                .tension(req.getTension())
                .temperature(req.getTemperature())
                .poids(req.getPoids())
                .taille(req.getTaille())
                .notes(req.getNotes())
                .build();
        return null;
    }
}
