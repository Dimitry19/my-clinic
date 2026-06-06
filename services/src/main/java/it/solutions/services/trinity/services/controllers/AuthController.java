package it.solutions.services.trinity.services.controllers;

import it.solutions.services.trinity.core.security.services.JwtService;
import it.solutions.services.trinity.core.security.services.MyUserDetailsService;
import it.solutions.services.trinity.core.shared.api.ApiResponse;
import it.solutions.services.trinity.core.shared.entities.User;

import it.solutions.services.trinity.core.shared.enums.Role;
import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final MyUserDetailsService userDetailsService;
    private final JwtService jwtService;

    private final PasswordEncoder passwordEncoder;

    record LoginRequest(@Email String email, String password) {}
    record AuthResponse(UUID id, @Email String email, String role, String nom, String prenom) {}
    record Registration(@Email String email,String password,String name, String surname,String role) {}

    @PostMapping("/registration")
    public ResponseEntity<ApiResponse<AuthResponse>> registrate(@RequestBody Registration req) throws Exception {

        userDetailsService.exists(req.email());
        Role r= Role.valueOf(req.role());
        User user= new User();
        user.setEmail(req.email());
        user.setNom(req.name());
        user.setPrenom(req.surname());
        user.setRole(r);
        user.setMotDePasse(passwordEncoder.encode(req.password()));
        userDetailsService.save(user);

        //TODO Envoie du mail de confimation ou activation immediate ?
        return successLogin(user);
    }


    @PostMapping("/authenticate")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest req) throws Exception {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        User user = (User) userDetailsService.loadUserByUsername(req.email());
        return successLogin(user);
    }

    private ResponseEntity<ApiResponse<AuthResponse>> successLogin(User user) throws Exception{
        HttpHeaders responseHeaders = new HttpHeaders();
        jwtService.createNewTokens(user.getUsername(),null,null,responseHeaders);
        AuthResponse dto=new AuthResponse(user.getId(),user.getEmail(),user.getRole().name(),user.getNom(), user.getPrenom());
        return ResponseEntity.ok().headers(responseHeaders).body(ApiResponse.ok(dto));
    }
}
