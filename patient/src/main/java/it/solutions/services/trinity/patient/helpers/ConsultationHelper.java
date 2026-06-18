package it.solutions.services.trinity.patient.helpers;

import it.solutions.services.trinity.contracts.dto.EmployeDto;
import it.solutions.services.trinity.contracts.entities.PatientLight;
import it.solutions.services.trinity.contracts.port.AgendaLookupPort;
import it.solutions.services.trinity.contracts.port.EmployeLookupPort;
import it.solutions.services.trinity.core.shared.dao.UserDao;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.enums.StatutConsultation;
import it.solutions.services.trinity.core.shared.utils.GenericUtils;
import it.solutions.services.trinity.patient.dao.PatientDao;
import it.solutions.services.trinity.patient.dto.ConsultationDto;
import it.solutions.services.trinity.patient.entities.Consultation;
import it.solutions.services.trinity.patient.validations.PatientValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ConsultationHelper {



    private final UserDao userDao;
    private final PatientDao patientDao;
    private final PatientValidator patientValidator;
    private final EmployeLookupPort employeLookupPort;
    private final AgendaLookupPort agendaLookupPort;



    public EmployeDto.Response checkMedecin(UUID userId){
        return employeLookupPort.findById(userId);
    }

    public void checkPatient(UUID patientId){
        patientValidator.existsPatient(patientId);
    }

    public Consultation builder(ConsultationDto.Request req) {
        return Consultation.builder()
                .patientId(req.getPatientId())
                .medecinId(req.getMedecinId())
                .rendezVousId(req.getRendezVousId())
                .type(req.getType())
                .statut(req.getStatut())
                .motif(req.getMotif())
                .symptomes(req.getSymptomes())
                .diagnostic(req.getDiagnostic())
                .traitement(req.getTraitement())
                .tension(req.getTension())
                .temperature(req.getTemperature())
                .poids(req.getPoids())
                .taille(req.getTaille())
                .statut(StatutConsultation.PLANIFIEE)
                .notes(req.getNotes())
                .dureeMinutes(req.getDureeMinutes())
                .build();
    }

    public ConsultationDto.Response toResponse(Consultation c) {
        PatientLight patient = patientDao.findPatientLight(c.getPatientId()).
                orElseThrow(() -> new EntityNotFoundException("Patient introuvable"));

        User user=userDao.findById(c.getMedecinId()).orElseThrow(()-> new EntityNotFoundException("Médecin introuvable"));



        String nom = GenericUtils.normalizeUpper(user.getNom());
        String prenom = GenericUtils.normalize(user.getPrenom());
        return ConsultationDto.Response.builder()
                .id(c.getId())
                .patientId(c.getPatientId())
                .medecinId(c.getMedecinId())
                .rendezVousId(c.getRendezVousId())
                .patientNom(patient.getNom())
                .patientPrenom(patient.getPrenom())
                .medecinNom(GenericUtils.formatMedecinNom(nom,prenom))
                .dateHeure(agendaLookupPort.findById(c.getRendezVousId()).getDateHeure())
                .type(c.getType().name())
                .statut(c.getStatut().name())
                .motif(c.getMotif())
                .symptomes(c.getSymptomes())
                .diagnostic(c.getDiagnostic())
                .traitement(c.getTraitement())
                .tension(c.getTension())
                .temperature(c.getTemperature())
                .poids(c.getPoids())
                .taille(c.getTaille())
                .notes(c.getNotes())
                .dureeMinutes(c.getDureeMinutes())
                .statut(c.getStatut().name())
                .build();
    }
}
