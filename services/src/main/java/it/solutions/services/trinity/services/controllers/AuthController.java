package it.solutions.services.trinity.services.controllers;


import it.solutions.services.trinity.core.security.services.CookieUtils;
import it.solutions.services.trinity.core.security.services.JwtService;
import it.solutions.services.trinity.core.security.services.UserService;
import it.solutions.services.trinity.core.shared.api.ApiResponse;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.employe.helpers.EmployeHelper;
import it.solutions.services.trinity.employe.services.EmployeService;
import it.solutions.services.trinity.services.controllers.out.StatDashboard;
import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
 import org.springframework.security.authentication.*;
 import org.springframework.web.bind.annotation.*;

import java.util.UUID;




@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {


//    private final UserService userService;
//    private final EmployeService employeService;
//    private final JwtService jwtService;
//    private final EmployeHelper helper;
//
//
//    record AuthResponse(UUID id,UUID employeId, @Email String email, String role, String nom, String prenom) {}
//    record Registration(@Email String email,String password,String name, String surname,String role) {}
//
//    @PostMapping("/registration")
//    public ResponseEntity<ApiResponse<AuthResponse>> registrate(@RequestBody Registration req) throws Exception {
//
//        User user=userService.create(req.email(), req.role(),req.name(),req.surname(),req.password());
//        return successLogin(user);
//    }
//
//
//
//
//    private ResponseEntity<ApiResponse<AuthResponse>> successLogin(User user) {
//        HttpHeaders responseHeaders = new HttpHeaders();
//        jwtService.createNewTokens(user.getUsername(),null,null,responseHeaders);
//        UUID id=null;
//        if(!helper.isAdmin(user)){
//            id=employeService.findByUtilisateurId(user.getId()).getId();
//        }
//
//        AuthResponse dto=new AuthResponse(user.getId(),id,user.getEmail(),user.getRole().name(),user.getNom(), user.getPrenom());
//        return ResponseEntity.ok().headers(responseHeaders).body(ApiResponse.ok(dto));
//    }
}
