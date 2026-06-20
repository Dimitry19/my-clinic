package it.solutions.services.trinity.laboratoire.controller;


import it.solutions.services.trinity.contracts.dto.ExamenLaboDto;
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
    public ResponseEntity<Page<ExamenLaboDto.Response>> findByPatient(
            @PathVariable UUID patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.findByPatient(patientId, page, size));
    }

    @GetMapping("/consultation/{consultationId}")
    public ResponseEntity<List<ExamenLaboDto.Response>> findByConsultation(
            @PathVariable UUID consultationId) {
        return ResponseEntity.ok(service.findByConsultation(consultationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamenLaboDto.Response> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<ExamenLaboDto.Response> create(
            @Valid @RequestBody ExamenLaboDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExamenLaboDto.Response> edit(
            @PathVariable UUID id,
            @Valid @RequestBody ExamenLaboDto.Request req) {
        return ResponseEntity.ok(service.edit(id, req));
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<ExamenLaboDto.Response> changeStatut(
            @PathVariable UUID id,
            @Valid @RequestBody ExamenLaboDto.StatusRequest req) {
        return ResponseEntity.ok(service.changeStatut(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}