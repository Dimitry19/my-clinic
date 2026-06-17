package it.solutions.services.trinity.employe.services;


import it.solutions.services.trinity.core.security.services.UserService;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.employe.dao.CongeDao;
import it.solutions.services.trinity.employe.dao.EmployeDao;
import it.solutions.services.trinity.employe.dto.CongeDto;
import it.solutions.services.trinity.employe.dto.EmployeDto;
import it.solutions.services.trinity.employe.entities.Conge;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CongeService {

    private final UserService userService;
    private final CongeDao dao;
    private final EmployeDao employeDao;


//    @Cacheable(value = "conges", key = "#id")
//    public EmployeDto.Response findById(UUID id) {
//        return toResponse(dao.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Employé introuvable : " + id)));
//    }


    //@Cacheable(value = "conges", key = "#employeId")
    public List<CongeDto.Response> findCongeByEmploye(UUID employeId) {
         employeDao.findById(employeId)
                .orElseThrow(() -> new EntityNotFoundException("Employé introuvable : " + employeId));

        List<Conge> conges=dao.findCongeByEmploye(employeId);
        return  conges.stream().map(this::toResponse).toList();
    }



    public Page<CongeDto.Response> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateFin").ascending());
        return dao.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public CongeDto.Response create(EmployeDto.Request req)  {
        User user=userService.create(req.getEmail(), req.getRole().name(), req.getNom(),req.getPrenom(),null);
        Conge conge = Conge.builder()

                .build();
        return toResponse(dao.save(conge));
    }



    @Transactional
    @CacheEvict(value = "conges", key = "#id")
    public void delete(UUID id) {
        if (!dao.existsById(id)) throw new EntityNotFoundException("Conge introuvable : " + id);
        dao.deleteById(id);
    }

    private CongeDto.Response toResponse(Conge e) {
        long duree = Math.abs(ChronoUnit.DAYS.between(e.getDateFin(), e.getDateDebut()));
        return CongeDto.Response.builder()
                .id(e.getId())
                .typeConge(e.getTypeConge())
                .dateDebut(e.getDateDebut())
                .dateFin(e.getDateFin())
                .duree(duree)
                .motif(e.getMotif())
                .statut(e.getStatut().name())
                .approuvePar(e.getUser().getNom() + " " + e.getUser().getPrenom() )
                .build();
    }
}
