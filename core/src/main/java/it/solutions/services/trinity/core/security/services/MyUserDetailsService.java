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

import java.util.Optional;

@Service
@Transactional
@AllArgsConstructor
public class MyUserDetailsService implements UserDetailsService {


    protected final UserDao dao;



    public void exists(String email) throws Exception {
        Optional<User> optional = dao.findByEmail(email);
        if(optional.isPresent()){
            throw new Exception("Utilisateur deja existant");
        }
    }

    public User findByEmail(String email) {
        return dao.findByEmail(email).orElseThrow();

    }

    @Override
    public @NonNull UserDetails loadUserByUsername(String s) throws UsernameNotFoundException {
        return dao.findByEmail(s).orElseThrow(() -> new UsernameNotFoundException("User not found with email " + s));
    }

    public void save(User user) {
        dao.save(user);
    }
}