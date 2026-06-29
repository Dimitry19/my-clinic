package it.solutions.services.trinity.ordonnance.controller;



import it.solutions.services.trinity.contracts.dto.OrdonnanceDto;
import it.solutions.services.trinity.core.shared.api.ApiResponse;
import it.solutions.services.trinity.core.shared.utils.GenericUtils;
import it.solutions.services.trinity.ordonnance.services.OrdonnanceService;
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
@RequestMapping("/api/ordonnances")
@RequiredArgsConstructor
public class OrdonnanceController {

    private final OrdonnanceService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','INFIRMIER','PHARMACIEN')")
    public ResponseEntity<ApiResponse<Page<OrdonnanceDto.Response>>> findAll(
            @RequestParam(defaultValue = GenericUtils.PAGE) int page,
            @RequestParam(defaultValue = GenericUtils.SIZE) int size) {
        return ResponseEntity.ok(ApiResponse.ok(service.findAll(page, size)));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','INFIRMIER','PHARMACIEN')")
    public ResponseEntity<ApiResponse<List<OrdonnanceDto.Response>>> findByPatient(
            @PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.ok(service.findByPatient(patientId)));
    }

    @GetMapping("/consultation/{consultationId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','INFIRMIER','PHARMACIEN')")
    public ResponseEntity<ApiResponse<List<OrdonnanceDto.Response>>> findByConsultation(
            @PathVariable UUID consultationId) {
        return ResponseEntity.ok(ApiResponse.ok(service.findByConsultation(consultationId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','INFIRMIER','PHARMACIEN')")
    public ResponseEntity<ApiResponse<OrdonnanceDto.Response>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(service.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<OrdonnanceDto.Response>> create(
            @Valid @RequestBody OrdonnanceDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<OrdonnanceDto.Response>> edit(
            @PathVariable UUID id,
            @Valid @RequestBody OrdonnanceDto.Request req) {
        return ResponseEntity.ok(ApiResponse.ok(service.edit(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Ordonnance supprimée", null));
    }
}