package it.solutions.services.trinity.employe.adapters;

import it.solutions.services.trinity.contracts.dto.EmployeDto;
import it.solutions.services.trinity.contracts.port.EmployeLookupPort;
import it.solutions.services.trinity.core.shared.dao.UserDao;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.employe.dao.EmployeDao;
import it.solutions.services.trinity.employe.entities.Employe;
import it.solutions.services.trinity.employe.helpers.EmployeHelper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeAdapter implements EmployeLookupPort {

    private final UserDao userDao;
    private final EmployeDao dao;
    private final EmployeHelper helper;

    @Transactional(readOnly = true)
    @Override
    public EmployeDto.Response findById(UUID medecinId) {

        Employe employe = dao.findById(medecinId)
                .orElseThrow(()->new EntityNotFoundException("Employé introuvable"));

        return helper.toResponse(employe);
    }

    @Transactional(readOnly = true)
    @Override
    public EmployeDto.Response findEmployeByUtilisateur(UUID userId) {
        User user =userDao.findById(userId).orElseThrow(()->new EntityNotFoundException("Utilisateur(Employé) introuvable"));
        Employe employe = dao.findEmployeByUtilisateur(user)
                .orElseThrow(()->new EntityNotFoundException("Employé introuvable"));

        return helper.toResponse(employe);
    }
}