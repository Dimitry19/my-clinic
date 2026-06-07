package it.solutions.services.trinity.employe.validations;

import it.solutions.services.trinity.core.exception.ValidationException;

import it.solutions.services.trinity.core.shared.dao.UserDao;
import it.solutions.services.trinity.employe.dao.EmployeDao;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeValidator {

    private final UserDao userDao;
    private final EmployeDao dao;


    public void checkEmail(UUID id, String phone) {
        if (dao.existsByEmailAndIdNot(phone, id)) {
            throw new ValidationException(
                    "Un employé avec cet email existe déjà"
            );
        }
    }

    public void checkUserEmail(String email) {
        if (!userDao.existsByEmail(email)) {
            throw new ValidationException(
                    MessageFormat.format("Aucun utilisateur trouvé avec cet email:{0}", email)
            );
        }
    }
}
