package it.solutions.services.trinity.patient.controller;

import it.solutions.services.trinity.core.shared.api.ApiResponse;
import it.solutions.services.trinity.contracts.dto.ConsultationDto;
import it.solutions.services.trinity.contracts.dto.PatientDto;
import it.solutions.services.trinity.patient.services.ConsultationService;
import it.solutions.services.trinity.patient.services.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final ConsultationService consultationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','INFIRMIER','RECEPTIONNISTE')")
    public ResponseEntity<ApiResponse<Page<PatientDto.Response>>> all(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.findAll(page, size)));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','INFIRMIER','RECEPTIONNISTE')")
    public ResponseEntity<ApiResponse<Page<PatientDto.Response>>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.search(q, page, size)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','INFIRMIER')")
    public ResponseEntity<ApiResponse<PatientDto.Response>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','RECEPTIONNISTE')")
    public ResponseEntity<ApiResponse<PatientDto.Response>> create(@Valid @RequestBody PatientDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Patient créé", patientService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','RECEPTIONNISTE')")
    public ResponseEntity<ApiResponse<PatientDto.Response>> edit(
            @PathVariable UUID id, @Valid @RequestBody PatientDto.Request req) {
        return ResponseEntity.ok(ApiResponse.ok("Patient modifié", patientService.edit(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        patientService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Patient supprimé", null));
    }


    @PostMapping("/consultation")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<ConsultationDto.Response>> createConsultation(@Valid @RequestBody ConsultationDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Consultation créée", consultationService.create(req)));
    }
}