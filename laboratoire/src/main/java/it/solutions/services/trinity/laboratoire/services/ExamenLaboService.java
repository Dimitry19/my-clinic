package it.solutions.services.trinity.laboratoire.services;



import it.solutions.services.trinity.contracts.dto.ExamenLaboDto;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.enums.StatutExamenLabo;
import it.solutions.services.trinity.core.security.services.UserService;

import it.solutions.services.trinity.laboratoire.dao.ExamenLaboDao;
import it.solutions.services.trinity.laboratoire.entities.ExamenLabo;
import it.solutions.services.trinity.laboratoire.helper.ExamenLaboHelper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExamenLaboService {

    private final ExamenLaboDao dao;
    private final UserService userService;
    private final ExamenLaboHelper helper;


    @Transactional(readOnly = true)
    public Page<ExamenLaboDto.Response> all(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return dao.findAll(pageable).map(helper::toResponse);
    }
    @Transactional(readOnly = true)
    public Page<ExamenLaboDto.Response> findByPatient(UUID patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return dao.findByPatientId(patientId, pageable).map(helper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ExamenLaboDto.Response> findByConsultation(UUID consultationId) {
        return dao.findByConsultationId(consultationId)
                .stream()
                .map(helper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ExamenLaboDto.Response findById(UUID id) {
        return helper.toResponse(helper.findOrThrow(id));
    }

    @Transactional
    public ExamenLaboDto.Response create(ExamenLaboDto.Request req) {
        return helper.toResponse(dao.save(helper.builder(req)));
    }

    @Transactional
    public ExamenLaboDto.Response edit(UUID id, ExamenLaboDto.Request req) {
        ExamenLabo examen = helper.findOrThrow(id);
        User prescripteur = userService.findById(req.getPrescritPar());


        //TODO Faire les validations entre les dates de prescription , consultation et resultats

        examen.setPrescritPar(prescripteur);
        examen.setTypeExamen(req.getTypeExamen());
        examen.setDescription(req.getDescription());
        examen.setStatut(req.getStatut() != null ? req.getStatut() : examen.getStatut());
        examen.setDatePrescription(req.getDatePrescription());
        examen.setDateResultat(req.getDateResultat());

        return helper.toResponse(dao.save(examen));
    }

    @Transactional
    public ExamenLaboDto.Response changeStatut(UUID id, ExamenLaboDto.StatusRequest req) {
        ExamenLabo examen = helper.findOrThrow(id);
        examen.setStatut(req.getStatut());
        if (req.getStatut() == StatutExamenLabo.TERMINE && examen.getDateResultat() == null) {
            examen.setDateResultat(LocalDateTime.now());
        }
        if (req.getStatut() == StatutExamenLabo.ANNULE) {
            examen.setDateResultat(null);
        }
        return helper.toResponse(dao.save(examen));
    }

    @Transactional
    public void delete(UUID id) {
        if (!dao.existsById(id)) {
            throw new EntityNotFoundException("Examen introuvable : " + id);
        }
        dao.deleteById(id);
    }
}