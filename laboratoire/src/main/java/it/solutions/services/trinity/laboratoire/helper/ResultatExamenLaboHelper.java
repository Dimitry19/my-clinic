package it.solutions.services.trinity.laboratoire.helper;

import it.solutions.services.trinity.contracts.dto.ResultatExamenLaboDto;
import it.solutions.services.trinity.contracts.port.EmployeLookupPort;
import it.solutions.services.trinity.core.helpers.CoreHelper;
import it.solutions.services.trinity.core.shared.dao.UserDao;
import it.solutions.services.trinity.core.shared.entities.UserLight;
import it.solutions.services.trinity.core.shared.utils.GenericUtils;
import it.solutions.services.trinity.laboratoire.dao.ExamenLaboDao;
import it.solutions.services.trinity.laboratoire.dao.ResultatExamenLaboDao;
import it.solutions.services.trinity.laboratoire.entities.ExamenLabo;
import it.solutions.services.trinity.laboratoire.entities.ParametreResultat;
import it.solutions.services.trinity.laboratoire.entities.ResultatExamenLabo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
public class ResultatExamenLaboHelper extends CoreHelper {

    private final ResultatExamenLaboDao dao;
    private final ExamenLaboDao examenLaboDao;




    public ResultatExamenLaboHelper(UserDao userDao, ResultatExamenLaboDao dao, ExamenLaboDao examenLaboDao) {
        super(userDao);
        this.dao = dao;
        this.examenLaboDao = examenLaboDao;
    }

    @Transactional(readOnly = true)
    public UserLight getLaborantin(UUID id){
        return userDao.findUserLight(id) .orElseThrow(() -> new EntityNotFoundException("Laborantin introuvable "));
    }

    @Transactional(readOnly = true)
    public ExamenLabo getExamen(UUID id){
        return examenLaboDao.findByIdFetch(id).orElseThrow(() -> new EntityNotFoundException("Examen laboratoire introuvable "));
    }




    @Transactional(readOnly = true)
    public ResultatExamenLabo findOrThrow(UUID id) {
        return dao.findByIdFetch(id)
                .orElseThrow(() -> new EntityNotFoundException("Résultat examen introuvable "));
    }

    @Transactional
    public ResultatExamenLabo builder(ResultatExamenLaboDto.Request req) {
        UserLight laborantin = userDao.findUserLight(req.getLaborantinId()) .orElseThrow(() -> new EntityNotFoundException("Laborantin introuvable "));
        ExamenLabo examenLabo=examenLaboDao.findByIdFetch(req.getExamenId()).orElseThrow(() -> new EntityNotFoundException("Examen laboratoire introuvable "));

        List<ParametreResultat> parametres =builderParametres(req);

        return ResultatExamenLabo.builder()
                .laborantin(laborantin)
                .examen(examenLabo)
                .interpretation(req.getInterpretation())
                .parametres(parametres)
                .pdfPath(null)
                .createdAt(  LocalDateTime.now())
                .build();
    }

    public List<ParametreResultat> builderParametres(ResultatExamenLaboDto.Request req) {
        return req.getParametres() != null
                ? req.getParametres().stream()
                .map(p -> new ParametreResultat(
                        p.getLibelle(),
                        p.getValeur(),
                        p.getUnite(),
                        p.getNorme(),
                        p.isAnormal()
                ))
                .toList()
                : List.of();

    }
    public ResultatExamenLaboDto.Response toResponse(ResultatExamenLabo r) {
        UserLight laborantin = r.getLaborantin();
        return ResultatExamenLaboDto.Response.builder()
                .id(r.getId())
                .examenId(r.getExamen().getId())
                .laborantinId(laborantin.getId())
                .laborantinNom(GenericUtils.formatNomPrenom(laborantin.getNom() ,laborantin.getPrenom()))
                .parametres(r.getParametres() != null
                        ? r.getParametres().stream()
                        .map(p -> ResultatExamenLaboDto.ParametreResultatDto.builder()
                                .libelle(p.libelle())
                                .valeur(p.valeur())
                                .unite(p.unite())
                                .norme(p.norme())
                                .anormal(p.anormal())
                                .build())
                        .toList()
                        : List.of())
                .interpretation(r.getInterpretation())
                .pdfPath(r.getPdfPath())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
