package it.solutions.services.trinity.laboratoire.services;


import it.solutions.services.trinity.contracts.dto.ResultatExamenLaboDto;
import it.solutions.services.trinity.core.shared.entities.UserLight;
import it.solutions.services.trinity.laboratoire.dao.ResultatExamenLaboDao;
import it.solutions.services.trinity.laboratoire.entities.ExamenLabo;
import it.solutions.services.trinity.laboratoire.entities.ParametreResultat;
import it.solutions.services.trinity.laboratoire.entities.ResultatExamenLabo;
import it.solutions.services.trinity.laboratoire.helper.ResultatExamenLaboHelper;
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
public class ResultatExamenLaboService {

    private final ResultatExamenLaboDao dao;
    private final ResultatExamenLaboHelper helper;


    @Transactional(readOnly = true)
    public Page<ResultatExamenLaboDto.Response> all(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return dao.findAll(pageable).map(helper::toResponse);
    }


    @Transactional(readOnly = true)
    public  ResultatExamenLaboDto.Response  findByExamen(UUID examenId) {
        return helper.toResponse(dao.findByExamen(helper.getExamen(examenId)));
    }

    @Transactional(readOnly = true)
    public ResultatExamenLaboDto.Response findById(UUID id) {
        return helper.toResponse(helper.findOrThrow(id));
    }

    @Transactional
    public ResultatExamenLaboDto.Response create(ResultatExamenLaboDto.Request req) {
        return helper.toResponse(dao.save(helper.builder(req)));
    }

    @Transactional
    public ResultatExamenLaboDto.Response edit(UUID id, ResultatExamenLaboDto.Request req) {
        ResultatExamenLabo resultat = helper.findOrThrow(id);
        UserLight laborantin = helper.getLaborantin(req.getLaborantinId());
        ExamenLabo examen = helper.getExamen(req.getExamenId());

        List<ParametreResultat> parametres =helper.builderParametres(req);
        resultat.setLaborantin(laborantin);
        resultat.setExamen(examen);
        resultat.setInterpretation(req.getInterpretation());
        resultat.setParametres(parametres);
        return helper.toResponse(dao.save(resultat));
    }



    @Transactional
    public void delete(UUID id) {
        if (!dao.existsById(id)) {
            throw new EntityNotFoundException("Résultat introuvable : " + id);
        }
        dao.deleteById(id);
    }
}