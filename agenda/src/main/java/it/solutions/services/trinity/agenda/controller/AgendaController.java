package it.solutions.services.trinity.agenda.controller;

import it.solutions.services.trinity.agenda.services.AgendaService;
import it.solutions.services.trinity.contracts.dto.AgendaDto;
import it.solutions.services.trinity.core.security.services.JwtService;
import it.solutions.services.trinity.core.shared.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static it.solutions.services.trinity.core.shared.Constants.COOKIE_ACCESS_TOKEN;

@RestController
@RequestMapping("/api/agenda")
@RequiredArgsConstructor
public class AgendaController {

    private final AgendaService service;
    private final JwtService jwtService;


    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','INFIRMIER','RECEPTIONNISTE')")
    public ResponseEntity<ApiResponse<List<AgendaDto.Response>>> findAgendaByPeriode(
                                                                                     @RequestParam  int annee,
                                                                                     @RequestParam int mois,
                                                                                     @CookieValue(name = COOKIE_ACCESS_TOKEN) String accessToken) {

        return ResponseEntity.ok(ApiResponse.ok(service.findAgendaByPeriode(jwtService.extraireEmail(accessToken),annee, mois)));
    }


    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<AgendaDto.Response>> create(@Valid @RequestBody AgendaDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Rendez-vous créé", service.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<AgendaDto.Response>> edit(
            @PathVariable UUID id, @Valid @RequestBody AgendaDto.Request req) {
        return ResponseEntity.ok(ApiResponse.ok("Rendez-vous modifié", service.edit(id, req)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<AgendaDto.Response>> changeStatus(@PathVariable UUID id, @RequestBody AgendaDto.StatusRequest statut) {

        return ResponseEntity.ok(ApiResponse.ok("Statut du rendez-vous modifié", service.changeStatus(id, statut)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Rendez-vous supprimé", null));
    }


    @GetMapping("/medecin/{patientId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','INFIRMIER','RECEPTIONNISTE')")
    public ResponseEntity<ApiResponse<List<AgendaDto.Response>>> findAgendaByDoctorAndPatient(@PathVariable UUID patientId,
                                                                                              @RequestParam  UUID medecinId,
                                                                                    @RequestParam  int annee,
                                                                                    @RequestParam int mois ) {

        return ResponseEntity.ok(ApiResponse.ok(service.findAgendaByDoctorAndPatient(medecinId,patientId,annee, mois)));
    }

}
