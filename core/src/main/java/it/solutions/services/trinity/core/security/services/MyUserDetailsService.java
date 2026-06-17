package it.solutions.services.trinity.core.security.services;

import it.solutions.services.trinity.core.exception.ValidationException;
import it.solutions.services.trinity.core.security.PasswordUtils;
import it.solutions.services.trinity.core.shared.dao.UserDao;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.enums.Role;

import lombok.AllArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.MessageFormat;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@AllArgsConstructor
public class MyUserDetailsService implements UserDetailsService {


    private final UserDao dao;


    private static final String utilisateurIntrouvable="Aucun utilisateur trouvé  [{0}]";




    public void exists(String email) throws ValidationException {
        Optional<User> optional = dao.findByEmail(email);
        if(optional.isPresent()){
            throw new ValidationException(MessageFormat.format("Utilisateur deja existant avec  adresse email [{0}]",email));
        }
    }

    public User findByEmail(String email) {
        return dao.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException(MessageFormat.format(utilisateurIntrouvable,email)));
    }
    public User findById(UUID id) {
        return dao.findById(id).orElseThrow(() -> new UsernameNotFoundException(MessageFormat.format(utilisateurIntrouvable,id)));
    }

    @Override
    public @NonNull UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return dao.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException(MessageFormat.format(utilisateurIntrouvable,email)));
    }

    public void save(User user) {
        dao.save(user);
    }
}