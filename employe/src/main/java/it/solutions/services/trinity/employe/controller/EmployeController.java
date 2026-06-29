package it.solutions.services.trinity.employe.controller;

import it.solutions.services.trinity.core.shared.api.ApiResponse;

import it.solutions.services.trinity.core.shared.enums.Departement;
import it.solutions.services.trinity.core.shared.utils.GenericUtils;
import it.solutions.services.trinity.employe.adapters.EmployeAdapter;
import it.solutions.services.trinity.employe.dto.CongeDto;
import it.solutions.services.trinity.contracts.dto.EmployeDto;
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

    private final EmployeService service;
    private final FicheDePaieService ficheDePaieService;
    private final CongeService congeService;
    private final EmployeAdapter adapter;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN','INFIRMIER','RECEPTIONNISTE')")
    public ResponseEntity<ApiResponse<Page<EmployeDto.Response>>> all(
            @RequestParam(defaultValue = GenericUtils.PAGE) int page,
            @RequestParam(defaultValue = GenericUtils.SIZE) int size) {
        return ResponseEntity.ok(ApiResponse.ok(service.findAll(page, size)));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<Page<EmployeDto.Response>>> search(
            @RequestParam String q,
            @RequestParam(required = false) String departement,
            @RequestParam(defaultValue = GenericUtils.PAGE) int page,
            @RequestParam(defaultValue = GenericUtils.SIZE) int size) {
        return ResponseEntity.ok(ApiResponse.ok(service.search(q,departement, page, size)));
    }

    @GetMapping("/search/medecin")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<Page<EmployeDto.Response>>> searchMedecin(
            @RequestParam String q,
            @RequestParam(defaultValue = GenericUtils.PAGE) int page,
            @RequestParam(defaultValue = GenericUtils.SIZE) int size) {
        return ResponseEntity.ok(ApiResponse.ok(service.searchMedecin(q, page, size)));
    }


    @GetMapping("/departement")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<Page<EmployeDto.Response>>> findEmployesByDepartement(
            @RequestParam(required = false) Departement departement,
            @RequestParam(defaultValue = GenericUtils.PAGE) int page,
            @RequestParam(defaultValue = GenericUtils.SIZE) int size) {
        return ResponseEntity.ok(ApiResponse.ok(service.findEmployesByDepartement(departement, page, size)));
    }

    @GetMapping("/consultation/departement")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<Page<EmployeDto.Response>>> findEmployesByDepartementConsultation(
            @RequestParam(required = false) Departement departement,
            @RequestParam(defaultValue = GenericUtils.PAGE) int page,
            @RequestParam(defaultValue = GenericUtils.SIZE) int size) {
        return ResponseEntity.ok(ApiResponse.ok(service.findEmployesByDepartementConsultation(departement, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeDto.Response>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(service.findById(id)));
    }
    @GetMapping("/user/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN','INFIRMIER')")
    public ResponseEntity<ApiResponse<EmployeDto.Response>> findByUtilisateurId(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(adapter.findEmployeByUtilisateur(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ApiResponse<EmployeDto.Response>> create(@Valid @RequestBody EmployeDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Employé créé", service.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN','RECEPTIONNISTE')")
    public ResponseEntity<ApiResponse<EmployeDto.Response>> edit(
            @PathVariable UUID id, @Valid @RequestBody EmployeDto.Request req) {
        return ResponseEntity.ok(ApiResponse.ok("Employé modifié", service.edit(id, req)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeDto.Response>> changeStatus(@PathVariable UUID id, @RequestBody EmployeDto.StatusRequest statut) {

        return ResponseEntity.ok(ApiResponse.ok("Statut de l'employé modifié", service.changeStatus(id, statut)));
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
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