package it.solutions.services.trinity.ordonnance.services;



import it.solutions.services.trinity.ordonnance.dao.OrdonnanceDao;
import it.solutions.services.trinity.contracts.dto.OrdonnanceDto;
import it.solutions.services.trinity.ordonnance.entities.Ordonnance;
import it.solutions.services.trinity.ordonnance.helpers.OrdonnanceHelper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrdonnanceService {

    private final OrdonnanceDao dao;
    private final OrdonnanceHelper helper;

    @Transactional(readOnly = true)
    public Page<OrdonnanceDto.Response> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return dao.findAllFetch(pageable).map(helper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<OrdonnanceDto.Response> findByPatient(UUID patientId) {
        return dao.findByPatientIdFetch(patientId)
                .stream().map(helper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<OrdonnanceDto.Response> findByConsultation(UUID consultationId) {
        return dao.findByConsultationIdFetch(consultationId)
                .stream().map(helper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrdonnanceDto.Response findById(UUID id) {
        return helper.toResponse(helper.findOrThrow(id));
    }

    @Transactional
    public OrdonnanceDto.Response create(OrdonnanceDto.Request req) {
        return helper.toResponse(dao.save(helper.builder(req)));
    }

    @Transactional
    public OrdonnanceDto.Response edit(UUID id, OrdonnanceDto.Request req) {
        Ordonnance ordonnance=helper.findOrThrow(id);
        return helper.toResponse(dao.save(helper.update(ordonnance,req)));
    }

    @Transactional
    public void delete(UUID id) {
        if (!dao.existsById(id))
            throw new EntityNotFoundException("Ordonnance introuvable : " + id);
        dao.deleteById(id);
    }
}
