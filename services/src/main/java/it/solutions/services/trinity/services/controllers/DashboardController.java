package it.solutions.services.trinity.services.controllers;

import it.solutions.services.trinity.contracts.dto.AgendaDto;
import it.solutions.services.trinity.core.security.services.CookieUtils;
import it.solutions.services.trinity.core.security.services.JwtService;
import it.solutions.services.trinity.core.shared.api.ApiResponse;
import it.solutions.services.trinity.services.controllers.out.RendezVous;
import it.solutions.services.trinity.services.controllers.out.StatDashboard;
import it.solutions.services.trinity.services.services.DashboardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static it.solutions.services.trinity.core.shared.Constants.COOKIE_ACCESS_TOKEN;


@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {


    private  final DashboardService dashboardService;
    private  final JwtService jwtService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN','SUPER_ADMIN' )")
    public ResponseEntity<ApiResponse<StatDashboard>> stats( @CookieValue(name = COOKIE_ACCESS_TOKEN) String accessToken) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.stats(email(accessToken))));
    }

    @GetMapping("/agenda/today")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<AgendaDto.Response>>> rendezVous(@CookieValue(name = COOKIE_ACCESS_TOKEN) String accessToken) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.rendezVous(email(accessToken))));
    }

    @GetMapping("/chart")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<Integer>>> chart() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.chart()));
    }


    private String email(String token){
        return jwtService.extraireEmail(token);
    }
}
