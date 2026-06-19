package it.solutions.services.trinity.core.helpers;

import it.solutions.services.trinity.core.shared.dao.UserDao;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.enums.Role;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CoreHelper {

    protected final UserDao userDao;

    public User findUserByEmail(String  email){
        return userDao.findByEmail(email).orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable " ));
    }

    public boolean isAdmin(User user) {
        return user.getRole().equals(Role.ADMIN) || user.getRole().equals(Role.SUPER_ADMIN);
    }
}
