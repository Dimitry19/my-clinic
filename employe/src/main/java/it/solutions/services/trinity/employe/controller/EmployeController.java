package it.solutions.services.trinity.employe.controller;

import it.solutions.services.trinity.core.shared.api.ApiResponse;

import it.solutions.services.trinity.employe.dto.CongeDto;
import it.solutions.services.trinity.employe.dto.EmployeDto;
import it.solutions.services.trinity.employe.dto.FicheDePaieDto;
import it.solutions.services.trinity.employe.services.CongeService;
import it.solutions.services.trinity.employe.services.EmployeService;
import it.solutions.services.trinity.employe.services.FicheDePaieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/employes")
@RequiredArgsConstructor
public class EmployeController {

    private final EmployeService employeService;
    private final FicheDePaieService ficheDePaieService;
    private final CongeService congeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN','INFIRMIER','RECEPTIONNISTE')")
    public ResponseEntity<ApiResponse<Page<EmployeDto.Response>>> all(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(employeService.findAll(page, size)));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<Page<EmployeDto.Response>>> search(
            @RequestParam String q,
            @RequestParam(required = false) String departement,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(employeService.search(q,departement, page, size)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN','INFIRMIER')")
    public ResponseEntity<ApiResponse<EmployeDto.Response>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(employeService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<EmployeDto.Response>> create(@Valid @RequestBody EmployeDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Employé créé", employeService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN','RECEPTIONNISTE')")
    public ResponseEntity<ApiResponse<EmployeDto.Response>> edit(
            @PathVariable UUID id, @Valid @RequestBody EmployeDto.Request req) {
        return ResponseEntity.ok(ApiResponse.ok("Employé modifié", employeService.edit(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        employeService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Employé supprimé", null));
    }



    @GetMapping("/paies/{employeId}")
    //@PreAuthorize("hasAnyRole('ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<List<FicheDePaieDto.Response>>> fichesDePaie(@PathVariable UUID employeId) {
        return ResponseEntity.ok(ApiResponse.ok(ficheDePaieService.findFicheDePaieByEmploye(employeId)));
    }

    @GetMapping("/conges/{employeId}")
    //@PreAuthorize("hasAnyRole('ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<List<CongeDto.Response>>> conges(@PathVariable UUID employeId) {
        return ResponseEntity.ok(ApiResponse.ok(congeService.findCongeByEmploye(employeId)));
    }
}