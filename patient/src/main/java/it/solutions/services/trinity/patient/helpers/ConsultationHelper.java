package it.solutions.services.trinity.patient.helpers;

import it.solutions.services.trinity.contracts.dto.EmployeDto;
import it.solutions.services.trinity.contracts.entities.PatientLight;
import it.solutions.services.trinity.contracts.port.AgendaLookupPort;
import it.solutions.services.trinity.contracts.port.EmployeLookupPort;
import it.solutions.services.trinity.core.helpers.CoreHelper;
import it.solutions.services.trinity.core.shared.dao.UserDao;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.enums.StatutConsultation;
import it.solutions.services.trinity.core.shared.utils.GenericUtils;
import it.solutions.services.trinity.patient.dao.PatientDao;
import it.solutions.services.trinity.contracts.dto.ConsultationDto;
import it.solutions.services.trinity.patient.entities.Consultation;
import it.solutions.services.trinity.patient.validations.PatientValidator;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;
import java.util.UUID;

@Component

public class ConsultationHelper extends CoreHelper{


    private final PatientDao patientDao;
    private final PatientValidator patientValidator;
    private final EmployeLookupPort employeLookupPort;
    private final AgendaLookupPort agendaLookupPort;

    public ConsultationHelper(UserDao userDao, PatientDao patientDao, PatientValidator patientValidator, EmployeLookupPort employeLookupPort, AgendaLookupPort agendaLookupPort) {
        super(userDao);
        this.patientDao = patientDao;
        this.patientValidator = patientValidator;
        this.employeLookupPort = employeLookupPort;
        this.agendaLookupPort = agendaLookupPort;
    }


    public EmployeDto.Response checkMedecin(UUID id){
        return employeLookupPort.findById(id);
    }

    public EmployeDto.Response findEmployeByUtilisateur(UUID userId){
        return employeLookupPort.findEmployeByUtilisateur(userId);
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

    public Consultation update(Consultation consultation , ConsultationDto.Request req) {
        consultation.setMedecinId(req.getMedecinId());
        consultation.setRendezVousId(req.getRendezVousId());
        consultation.setType(req.getType());
        consultation.setMotif(req.getMotif());
        consultation.setSymptomes(req.getSymptomes());
        consultation.setDiagnostic(req.getDiagnostic());
        consultation.setTraitement(req.getTraitement());
        consultation.setTension(req.getTension());
        consultation.setTemperature(req.getTemperature());
        consultation.setPoids(req.getPoids());
        consultation.setTaille(req.getTaille());
        consultation.setNotes(req.getNotes());
        consultation.setDureeMinutes(req.getDureeMinutes());

        return consultation;
    }

    public ConsultationDto.Response toResponse(Consultation c) {
        PatientLight patient = patientDao.findPatientLight(c.getPatientId()).
                orElseThrow(() -> new EntityNotFoundException("Patient introuvable"));

        User user=userDao.findById(c.getMedecinId()).orElseThrow(()-> new EntityNotFoundException("Médecin introuvable"));

        EmployeDto.Response medecin=findEmployeByUtilisateur(user.getId());
        int age = Period.between(patient.getDateNaissance(), LocalDate.now()).getYears();

        String nom = GenericUtils.normalizeUpper(user.getNom());
        String prenom = GenericUtils.normalize(user.getPrenom());
        return ConsultationDto.Response.builder()
                .id(c.getId())
                .patientId(c.getPatientId())
                .medecinId(c.getMedecinId())
                .rendezVousId(c.getRendezVousId())
                .patientNom(patient.getNom())
                .patientPrenom(patient.getPrenom())
                .age(age)
                .medecinNom(GenericUtils.formatMedecinNom(nom,prenom))
                .departement(medecin.getDepartement())
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
