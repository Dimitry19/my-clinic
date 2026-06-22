package it.solutions.services.trinity.employe.services;

import it.solutions.services.trinity.core.shared.enums.Departement;
import it.solutions.services.trinity.core.shared.enums.StatutEmploye;
import it.solutions.services.trinity.core.shared.events.employe.EmployeStatusChangedEvent;
import it.solutions.services.trinity.employe.dao.EmployeDao;
import it.solutions.services.trinity.contracts.dto.EmployeDto;
import it.solutions.services.trinity.employe.entities.Employe;
import it.solutions.services.trinity.employe.helpers.EmployeHelper;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeService {

    private static final Sort SORT_BY_NOM = Sort.by("nom").ascending();

    private final EmployeDao dao;
    private final EmployeHelper helper;
    private final ApplicationEventPublisher publisher;

    @Transactional(readOnly = true)
    @Cacheable(value = "employes", key = "#id")
    public EmployeDto.Response findById(UUID id) {
        return helper.toResponse(helper.findEmployeOrThrow(id));
    }


    // readOnly = true garde la session Hibernate ouverte pendant tout le mapping
    // .map(helper::toResponse), ce qui évite le LazyInitializationException
    // sur le proxy `User` (relation @OneToOne LAZY). Combiné aux requêtes
    // *FetchUser ci-dessous (JOIN FETCH), on évite aussi le N+1 : sans elles,
    // la transaction ouverte aurait suffi à éviter l'exception, mais aurait
    // déclenché une requête SQL supplémentaire par employé de la page.
    @Transactional(readOnly = true)
    public Page<EmployeDto.Response> search(String query, String departement, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, SORT_BY_NOM);
        if (StringUtils.isEmpty(departement)) {
            return dao.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCaseFetchUser(query, pageable)
                    .map(helper::toResponse);
        }
        return dao.findByNomOrPrenomOrEmailAndDepartementFetchUser(query, departement, pageable)
                .map(helper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<EmployeDto.Response> searchMedecin(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, SORT_BY_NOM);

        return dao.findByNomOrPrenomOrEmailFetchUserMedecin(query, pageable).map(helper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<EmployeDto.Response> findEmployesByDepartement(Departement departement, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, SORT_BY_NOM);
        if (departement == null) {
            return dao.findAllFetchUser(pageable).map(helper::toResponse);
        }
        return dao.findEmployesByDepartementFetchUser(departement, pageable).map(helper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<EmployeDto.Response> findEmployesByDepartementConsultation(Departement departement, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, SORT_BY_NOM);
        if (departement == null) {
            return dao.findAllFetchUser(pageable).map(helper::toResponse);
        }
        return dao.findEmployesByDepartementConsultation(departement, pageable).map(helper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<EmployeDto.Response> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, SORT_BY_NOM);
        return dao.findAllFetchUser(pageable).map(helper::toResponse);
    }

    @Transactional
    public EmployeDto.Response create(EmployeDto.Request req) {
        Employe employe = helper.buildNewEmploye(req);
        return helper.toResponse(dao.save(employe));
    }

    @Transactional
    @CacheEvict(value = "employes", key = "#id")
    public EmployeDto.Response edit(UUID id, EmployeDto.Request req) {
        Employe employe = helper.findEmployeOrThrow(id);

        String nom = it.solutions.services.trinity.core.shared.utils.GenericUtils.normalizeUpper(req.getNom());
        String prenom = it.solutions.services.trinity.core.shared.utils.GenericUtils.normalize(req.getPrenom());

        helper.resolveOrCreateUser(employe, req, nom, prenom);
        helper.applyEmployeUpdates(employe, req, nom, prenom);

        return helper.toResponse(dao.save(employe));
    }

    @Transactional
    @CacheEvict(value = "employes", key = "#id")
    public EmployeDto.Response changeStatus(UUID id, EmployeDto.StatusRequest statutEmploye) {
        Employe employe = helper.findEmployeOrThrow(id);
        boolean actif = StatutEmploye.ACTIF.name().equals(statutEmploye.getStatut());

        employe.setActif(actif);
        Employe saved = dao.save(employe);
        // Publie l'événement — employe ne sait pas qui (ni même si quelqu'un) écoute
        publisher.publishEvent(new EmployeStatusChangedEvent(
                saved.getId(),
                saved.getUtilisateur().getId(),
                actif
        ));
        return helper.toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "employes", key = "#id")
    public void delete(UUID id) {
        if (!dao.existsById(id)) {
            throw new jakarta.persistence.EntityNotFoundException("Employé introuvable : " + id);
        }
        dao.deleteById(id);
    }
}