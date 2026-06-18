package it.solutions.services.trinity.patient.services;

import it.solutions.services.trinity.patient.dao.PatientDao;
import it.solutions.services.trinity.contracts.dto.PatientDto;
import it.solutions.services.trinity.patient.entities.Patient;
import it.solutions.services.trinity.patient.helpers.PatientHelper;
import it.solutions.services.trinity.patient.validations.PatientValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private static final Sort SORT_BY_NOM = Sort.by("nom").ascending();
    private final PatientValidator validator;
    private final PatientDao dao;
    private final PatientHelper helper;

    @Cacheable(value = "patients", key = "#id")
    public PatientDto.Response findById(UUID id) {
        return helper.toResponse(dao.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patient introuvable ")));
    }

    public Page<PatientDto.Response> search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, SORT_BY_NOM);
        return dao.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseOrTelephoneContainingIgnoreCase(
                query, query,query, pageable).map(helper::toResponse);
    }

    public Page<PatientDto.Response> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, SORT_BY_NOM);
        return dao.findAll(pageable).map(helper::toResponse);
    }

    @Transactional
    public PatientDto.Response create(PatientDto.Request req)  {

        validator.validatePhone(req.getTelephone());
        Patient patient = helper.builder(req);
        return helper.toResponse(dao.save(patient));
    }

    @Transactional
    @CacheEvict(value = "patients", key = "#id")
    public PatientDto.Response edit(UUID id, PatientDto.Request req) {
        Patient patient = dao.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patient introuvable"));


        validator.validatePhone(id,req.getTelephone());
        helper.update(patient ,req);
        return helper.toResponse(dao.save(patient));
    }

    @Transactional
    @CacheEvict(value = "patients", key = "#id")
    public void delete(UUID id) {
        helper.checkPatient(id);
        dao.deleteById(id);
    }


}
