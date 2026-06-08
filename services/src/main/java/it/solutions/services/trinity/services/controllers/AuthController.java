package it.solutions.services.trinity.services.controllers;

import it.solutions.services.trinity.core.security.services.JwtService;
import it.solutions.services.trinity.core.security.services.MyUserDetailsService;
import it.solutions.services.trinity.core.security.services.UserService;
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
    private final UserService userService;
    private final JwtService jwtService;



    record LoginRequest(@Email String email, String password) {}
    record AuthResponse(UUID id, @Email String email, String role, String nom, String prenom) {}
    record Registration(@Email String email,String password,String name, String surname,String role) {}

    @PostMapping("/registration")
    public ResponseEntity<ApiResponse<AuthResponse>> registrate(@RequestBody Registration req) throws Exception {

        User user=userService.create(req.email(), req.role(),req.name(),req.surname(),req.password());
        return successLogin(user);
    }


    @PostMapping("/authenticate")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest req) throws Exception {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        User user = (User) userService.loadUserByUsername(req.email());
        return successLogin(user);
    }

    private ResponseEntity<ApiResponse<AuthResponse>> successLogin(User user) throws Exception{
        HttpHeaders responseHeaders = new HttpHeaders();
        jwtService.createNewTokens(user.getUsername(),null,null,responseHeaders);
        AuthResponse dto=new AuthResponse(user.getId(),user.getEmail(),user.getRole().name(),user.getNom(), user.getPrenom());
        return ResponseEntity.ok().headers(responseHeaders).body(ApiResponse.ok(dto));
    }
}
