package it.solutions.services.trinity.services.controllers;

import it.solutions.services.trinity.core.shared.api.ApiResponse;
import it.solutions.services.trinity.services.controllers.out.RendezVous;
import it.solutions.services.trinity.services.controllers.out.StatDashboard;
import it.solutions.services.trinity.services.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {


    private  final DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN','INFIRMIER','RECEPTIONNISTE')")
    public ResponseEntity<ApiResponse<StatDashboard>> stats() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.stats()));
    }

    @GetMapping("/agenda/today")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN','INFIRMIER')")
    public ResponseEntity<ApiResponse<List<RendezVous>>> rendezVous() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.rendezVous()));
    }

    @GetMapping("/chart")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN','INFIRMIER')")
    public ResponseEntity<ApiResponse<List<Integer>>> chart() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.chart()));
    }
}
