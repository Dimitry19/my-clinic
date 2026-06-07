package it.solutions.services.trinity.core.security.services;

import it.solutions.services.trinity.core.shared.dao.UserDao;
import it.solutions.services.trinity.core.shared.entities.User;
import lombok.AllArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.MessageFormat;
import java.util.Optional;

@Service
@Transactional
@AllArgsConstructor
public class MyUserDetailsService implements UserDetailsService {


    protected final UserDao dao;

    private static final String utilisateurIntrouvable="Aucun utilisateur trouvé avec cet email [{0}]";

    public void exists(String email) throws Exception {
        Optional<User> optional = dao.findByEmail(email);
        if(optional.isPresent()){
            throw new Exception("Utilisateur deja existant");
        }
    }

    public User findByEmail(String email) {
        return dao.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException(MessageFormat.format(utilisateurIntrouvable,email)));

    }

    @Override
    public @NonNull UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return dao.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException(MessageFormat.format(utilisateurIntrouvable,email)));
    }

    public void save(User user) {
        dao.save(user);
    }
}