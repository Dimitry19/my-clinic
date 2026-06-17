package it.solutions.services.trinity.services.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import it.solutions.services.trinity.core.security.services.CookieUtils;
import it.solutions.services.trinity.core.security.services.JwtService;
import it.solutions.services.trinity.core.security.services.MyUserDetailsService;
import it.solutions.services.trinity.core.security.services.UserService;
import it.solutions.services.trinity.core.shared.api.ApiResponse;
import it.solutions.services.trinity.core.shared.entities.User;

import it.solutions.services.trinity.core.shared.enums.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static it.solutions.services.trinity.core.shared.Constants.COOKIE_ACCESS_TOKEN;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserService userService;
    private final JwtService jwtService;
    private final CookieUtils cookieUtil;




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


    @GetMapping(value = "/logout")
    public  ResponseEntity<ApiResponse<Boolean>> logout() throws Exception {



        ApiResponse<Boolean> apiResponse = new ApiResponse<>();
        apiResponse.setSuccess(true);
        apiResponse.setMessage("Déconnexion complétée");
        apiResponse.setData(true);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add(HttpHeaders.SET_COOKIE, cookieUtil.deleteAccessTokenCookie().toString());
        responseHeaders.add(HttpHeaders.SET_COOKIE, cookieUtil.deleteRefreshTokenCookie().toString());

        SecurityContextHolder.clearContext();
        return  ResponseEntity.ok().headers(responseHeaders).body(apiResponse);
    }

    private ResponseEntity<ApiResponse<AuthResponse>> successLogin(User user) throws Exception{
        HttpHeaders responseHeaders = new HttpHeaders();
        jwtService.createNewTokens(user.getUsername(),null,null,responseHeaders);
        AuthResponse dto=new AuthResponse(user.getId(),user.getEmail(),user.getRole().name(),user.getNom(), user.getPrenom());
        return ResponseEntity.ok().headers(responseHeaders).body(ApiResponse.ok(dto));
    }
}
