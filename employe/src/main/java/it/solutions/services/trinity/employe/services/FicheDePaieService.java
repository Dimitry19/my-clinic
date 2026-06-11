package it.solutions.services.trinity.employe.services;

import it.solutions.services.trinity.employe.dao.EmployeDao;
import it.solutions.services.trinity.employe.dao.FicheDePaieDao;
import it.solutions.services.trinity.employe.dto.FicheDePaieDto;
import it.solutions.services.trinity.employe.entities.Employe;
import it.solutions.services.trinity.employe.entities.FicheDePaie;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class FicheDePaieService {


    private final FicheDePaieDao dao;
    private final EmployeDao employeDao;

    //@Cacheable(value = "fiches", key = "#employeId")
    public List<FicheDePaieDto.Response> findFicheDePaieByEmploye(UUID employeId) {
         Employe employe=employeDao.findById(employeId)
                .orElseThrow(() -> new EntityNotFoundException("Employé introuvable : " + employeId));

         List<FicheDePaie> fiches=dao.findFicheDePaieByEmploye(employe);
          return  fiches.stream().map(this::toResponse).toList();
    }


    private FicheDePaieDto.Response toResponse(FicheDePaie p) {

        return FicheDePaieDto.Response.builder()
                .id(p.getId())
                .mois(p.getMois())
                .annee(p.getAnnee())
                .salaireBrut(p.getSalaireBrut())
                .cotisations(p.getCotisations())
                .primes(p.getPrimes())
                .retenues(p.getRetenues())
                .salaireNet(p.getSalaireNet())
                .build();
    }
}
