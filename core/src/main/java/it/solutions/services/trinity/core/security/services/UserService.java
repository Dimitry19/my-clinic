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
public class UserService{


    private final PasswordEncoder passwordEncoder;
    private final MyUserDetailsService detailsService;



    public User create(String email, String role, String name, String surname, String password) throws ValidationException {
        detailsService.exists(email);
        String passwrd=passwordEncoder.encode(password);
        if(StringUtils.isEmpty(password)){
            passwrd=passwordEncoder.encode(PasswordUtils.generatePasswordEmploye(name,surname));
        }

        Role r= Role.valueOf(role);
        User user= new User();
        user.setEmail(email);
        user.setNom(name);
        user.setPrenom(surname);
        user.setRole(r);
        user.setMotDePasse(passwrd);
        detailsService.save(user);
        return user;
    }


    public @NonNull UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return detailsService.loadUserByUsername(email);
    }

    public   User findById(UUID id) throws UsernameNotFoundException {
        return detailsService.findById(id);
    }
}