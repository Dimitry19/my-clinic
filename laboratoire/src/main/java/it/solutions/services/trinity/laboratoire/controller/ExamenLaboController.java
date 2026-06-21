package it.solutions.services.trinity.laboratoire.controller;


import it.solutions.services.trinity.contracts.dto.ExamenLaboDto;
import it.solutions.services.trinity.core.shared.api.ApiResponse;
import it.solutions.services.trinity.laboratoire.services.ExamenLaboService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/laboratoire")
@RequiredArgsConstructor
public class ExamenLaboController {

    private final ExamenLaboService service;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<Page<ExamenLaboDto.Response>>> findByPatient(
            @PathVariable UUID patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(service.findByPatient(patientId, page, size)));
    }

    @GetMapping("/consultation/{consultationId}")
    public ResponseEntity<ApiResponse<List<ExamenLaboDto.Response>>> findByConsultation(
            @PathVariable UUID consultationId) {
        return ResponseEntity.ok(ApiResponse.ok(service.findByConsultation(consultationId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExamenLaboDto.Response>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExamenLaboDto.Response>> create(
            @Valid @RequestBody ExamenLaboDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExamenLaboDto.Response>> edit(
            @PathVariable UUID id,
            @Valid @RequestBody ExamenLaboDto.Request req) {
        return ResponseEntity.ok(ApiResponse.ok(service.edit(id, req)));
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<ApiResponse<ExamenLaboDto.Response>> changeStatut(
            @PathVariable UUID id,
            @Valid @RequestBody ExamenLaboDto.StatusRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(service.changeStatut(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Examen supprimé", null));
    }
}