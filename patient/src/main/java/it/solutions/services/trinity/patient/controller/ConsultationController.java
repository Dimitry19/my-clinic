package it.solutions.services.trinity.patient.controller;

import it.solutions.services.trinity.contracts.dto.AgendaDto;
import it.solutions.services.trinity.core.shared.api.ApiResponse;
import it.solutions.services.trinity.contracts.dto.ConsultationDto;
import it.solutions.services.trinity.contracts.dto.PatientDto;
import it.solutions.services.trinity.core.shared.utils.GenericUtils;
import it.solutions.services.trinity.patient.services.ConsultationService;
import it.solutions.services.trinity.patient.services.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final PatientService patientService;
    private final ConsultationService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','INFIRMIER','RECEPTIONNISTE')")
    public ResponseEntity<ApiResponse<Page<PatientDto.Response>>> all(
            @RequestParam(defaultValue = GenericUtils.PAGE) int page,
            @RequestParam(defaultValue = GenericUtils.SIZE) int size) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.findAll(page, size)));
    }

    @GetMapping("/patient/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','INFIRMIER')")
    public ResponseEntity<ApiResponse<Page<ConsultationDto.Response>>> findAllByPatient(
            @PathVariable UUID id,
            @RequestParam(defaultValue = GenericUtils.PAGE) int page,
            @RequestParam(defaultValue = GenericUtils.SIZE) int size) {
        return ResponseEntity.ok(ApiResponse.ok(service.findAllByPatient(id, page, size)));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','INFIRMIER','RECEPTIONNISTE')")
    public ResponseEntity<ApiResponse<Page<PatientDto.Response>>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = GenericUtils.PAGE) int page,
            @RequestParam(defaultValue = GenericUtils.SIZE) int size){
        return ResponseEntity.ok(ApiResponse.ok(patientService.search(q, page, size)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','INFIRMIER')")
    public ResponseEntity<ApiResponse<ConsultationDto.Response>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(service.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<ConsultationDto.Response>> createConsultation(@Valid @RequestBody ConsultationDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Consultation créée", service.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<ConsultationDto.Response>> edit(@PathVariable UUID id, @Valid @RequestBody ConsultationDto.Request req) {
        return ResponseEntity.ok(ApiResponse.ok("Consultation modifiée", service.edit(id, req)));
    }


    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<ConsultationDto.Response>> changeStatus(@PathVariable UUID id, @RequestBody ConsultationDto.StatusRequest statut) {

        return ResponseEntity.ok(ApiResponse.ok("Statut de la consultation modifié", service.changeStatus(id, statut)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Consultation supprimée", null));
    }
}