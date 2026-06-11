package it.solutions.services.trinity.employe.services;


import it.solutions.services.trinity.core.security.services.UserService;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.enums.Statut;
import it.solutions.services.trinity.employe.dao.EmployeDao;
import it.solutions.services.trinity.employe.dao.FicheDePaieDao;
import it.solutions.services.trinity.employe.dto.EmployeDto;

import it.solutions.services.trinity.employe.entities.Employe;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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

    private final UserService userService;
    private final EmployeDao dao;


    @Cacheable(value = "employes", key = "#id")
    public EmployeDto.Response findById(UUID id) {
        return toResponse(dao.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employé introuvable : " + id)));
    }

    public Page<EmployeDto.Response> search(String query, String departement, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("nom").ascending());
        if(StringUtils.isEmpty(departement)){
            return dao.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(
                    query, query, pageable).map(this::toResponse);
        }
        return dao.findByNomOrPrenomOrEmailAndDepartement( query, departement, pageable).map(this::toResponse);

    }

    public Page<EmployeDto.Response> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("nom").ascending());
        return dao.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public EmployeDto.Response create(EmployeDto.Request req)  {
        User user=userService.create(req.getEmail(), req.getRole().name(), req.getNom(),req.getPrenom(),null);
        Employe employe = Employe.builder()
                .nom(req.getNom().toUpperCase())
                .prenom(req.getPrenom())
                .poste(req.getPoste())
                .departement(req.getDepartement())
                .telephone(req.getTelephone())
                .email(req.getEmail())
                .dateEmbauche(req.getDateEmbauche())
                .salaireBase(req.getSalaireBase())
                .typeContrat(req.getTypeContrat())
                .numeroCnss(req.getNumeroCnss())
                .rib(req.getRib())
                .actif(true)
                .utilisateurId(user.getId())
                .build();
        return toResponse(dao.save(employe));
    }

    @Transactional
    @CacheEvict(value = "employes", key = "#id")
    public EmployeDto.Response edit(UUID id, EmployeDto.Request req) {
        Employe employe = dao.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employé introuvable : " + id));

        if(employe.getUtilisateurId()==null){
            User user=userService.create(req.getEmail(), req.getRole().name(), req.getNom(),req.getPrenom(),null);
            employe.setUtilisateurId(user.getId());

        }
        employe.setNom(req.getNom().toUpperCase());
        employe.setPrenom(req.getPrenom());
        employe.setPoste(req.getPoste());
        employe.setDepartement(req.getDepartement());
        employe.setTelephone(req.getTelephone());
        employe.setEmail(req.getEmail());
        employe.setDateEmbauche(req.getDateEmbauche());
        employe.setSalaireBase(req.getSalaireBase());
        employe.setTypeContrat(req.getTypeContrat());
        employe.setNumeroCnss(req.getNumeroCnss());
        employe.setRib(req.getRib());
        employe.setActif(req.getStatut().equals(Statut.ACTIF));

        return toResponse(dao.save(employe));
    }

    @Transactional
    @CacheEvict(value = "employes", key = "#id")
    public void delete(UUID id) {
        if (!dao.existsById(id)) throw new EntityNotFoundException("Employé introuvable : " + id);
        dao.deleteById(id);
    }

    private EmployeDto.Response toResponse(Employe e) {
        User user=userService.findById(e.getUtilisateurId());
        return EmployeDto.Response.builder()
                .nom(e.getNom().toUpperCase())
                .prenom(e.getPrenom())
                .poste(e.getPoste())
                .departement(e.getDepartement().name())
                .telephone(e.getTelephone())
                .email(e.getEmail())
                .dateEmbauche(e.getDateEmbauche())
                .salaireBase(e.getSalaireBase())
                .typeContrat(e.getTypeContrat().name())
                .numeroCnss(e.getNumeroCnss())
                .rib(e.getRib())
                .id(e.getId())
                .utilisateurId(e.getUtilisateurId())
                .statut(e.isActif() ? Statut.ACTIF.name():Statut.INACTIF.name())
                .role(user.getRole().name())
                .build();
    }
}
