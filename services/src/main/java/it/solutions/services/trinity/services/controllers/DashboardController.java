package it.solutions.services.trinity.services.controllers;

import it.solutions.services.trinity.contracts.dto.AgendaDto;
import it.solutions.services.trinity.core.shared.api.ApiResponse;
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
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN','SUPER_ADMIN' )")
    public ResponseEntity<ApiResponse<StatDashboard>> stats( @RequestParam String email) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.stats(email)));
    }

    @GetMapping("/agenda/today")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<AgendaDto.Response>>> rendezVous(@RequestParam String email) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.rendezVous(email)));
    }

    @GetMapping("/chart")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<Integer>>> chart() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.chart()));
    }


 }
