package it.solutions.services.trinity.patient.services;

import it.solutions.services.trinity.patient.dao.PatientDao;
import it.solutions.services.trinity.patient.dto.PatientDto;
import it.solutions.services.trinity.patient.entities.Patient;
import it.solutions.services.trinity.patient.validations.PatientValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.Period;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientValidator validator;
    private final PatientDao dao;

    @Cacheable(value = "patients", key = "#id")
    public PatientDto.Response findById(UUID id) {
        return toResponse(dao.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patient introuvable : " + id)));
    }

    public Page<PatientDto.Response> search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("nom").ascending());
        return dao.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrTelephoneContainingIgnoreCase(
                query, query,query, pageable).map(this::toResponse);
    }

    public Page<PatientDto.Response> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("nom").ascending());
        return dao.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public PatientDto.Response create(PatientDto.Request req)  {

        validator.validatePhone(req.getTelephone());
        Patient patient = Patient.builder()
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
        return toResponse(dao.save(patient));
    }

    @Transactional
    @CacheEvict(value = "patients", key = "#id")
    public PatientDto.Response edit(UUID id, PatientDto.Request req) {
        Patient patient = dao.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patient introuvable : " + id));


        validator.validatePhone(id,req.getTelephone());
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
        return toResponse(dao.save(patient));
    }

    @Transactional
    @CacheEvict(value = "patients", key = "#id")
    public void delete(UUID id) {
        if (!dao.existsById(id)) throw new EntityNotFoundException("Patient introuvable : " + id);
        dao.deleteById(id);
    }

    private PatientDto.Response toResponse(Patient p) {
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
