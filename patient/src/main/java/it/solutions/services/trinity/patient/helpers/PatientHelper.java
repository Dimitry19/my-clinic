package it.solutions.services.trinity.patient.helpers;

import it.solutions.services.trinity.contracts.dto.PatientDto;
import it.solutions.services.trinity.patient.entities.Patient;
import it.solutions.services.trinity.patient.validations.PatientValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PatientHelper {


    private final PatientValidator patientValidator;



    public void checkPatient(UUID patientId){
        patientValidator.existsPatient(patientId);
    }

    public Patient builder(PatientDto.Request req) {
        return    Patient.builder()
                .nom(req.getNom().toUpperCase())
                .prenom(req.getPrenom())
                .dateNaissance(req.getDateNaissance())
                .sexe(req.getSexe())
                .telephone(req.getTelephone())
                .email(req.getEmail())
                .adresse(req.getAdresse())
                .groupeSanguin(req.getGroupeSanguin())
                .allergies(req.getAllergies())
                .antecedents(req.getAntecedents())
                .mutuelle(req.getMutuelle())
                .numeroMutuelle(req.getNumeroMutuelle())
                .contactUrgenceNom(req.getContactUrgenceNom())
                .contactUrgenceTel(req.getContactUrgenceTel())
                .notesGenerales(req.getNotesGenerales())
                .build();
    }

    public Patient update(Patient patient ,PatientDto.Request req) {
        patient.setNom(req.getNom().toUpperCase());
        patient.setPrenom(req.getPrenom());
        patient.setDateNaissance(req.getDateNaissance());
        patient.setTelephone(req.getTelephone());
        patient.setEmail(req.getEmail());
        patient.setAdresse(req.getAdresse());
        patient.setGroupeSanguin(req.getGroupeSanguin());
        patient.setAllergies(req.getAllergies());
        patient.setAntecedents(req.getAntecedents());
        patient.setMutuelle(req.getMutuelle());
        patient.setNumeroMutuelle(req.getNumeroMutuelle());
        patient.setContactUrgenceNom(req.getContactUrgenceNom());
        patient.setContactUrgenceTel(req.getContactUrgenceTel());
        patient.setNotesGenerales(req.getNotesGenerales());
        return patient;
    }

    public PatientDto.Response toResponse(Patient p) {
        int age = Period.between(p.getDateNaissance(), LocalDate.now()).getYears();
        return PatientDto.Response.builder()
                .id(p.getId()).nom(p.getNom()).prenom(p.getPrenom())
                .dateNaissance(p.getDateNaissance()).sexe(p.getSexe().name())
                .telephone(p.getTelephone()).email(p.getEmail())
                .adresse(p.getAdresse()).groupeSanguin(p.getGroupeSanguin().getLibelle())
                .allergies(p.getAllergies()).antecedents(p.getAntecedents())
                .mutuelle(p.getMutuelle()).numeroMutuelle(p.getNumeroMutuelle())
                .contactUrgenceNom(p.getContactUrgenceNom())
                .contactUrgenceTel(p.getContactUrgenceTel())
                .notesGenerales(p.getNotesGenerales()).age(age).build();
    }
}
