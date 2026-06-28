package it.solutions.services.trinity.laboratoire.controller;


import it.solutions.services.trinity.contracts.dto.ExamenLaboDto;
import it.solutions.services.trinity.contracts.dto.ResultatExamenLaboDto;
import it.solutions.services.trinity.core.shared.api.ApiResponse;
import it.solutions.services.trinity.core.shared.utils.GenericUtils;
import it.solutions.services.trinity.laboratoire.services.ResultatExamenLaboService;
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
@RequestMapping("/api/resultats-labo")
@RequiredArgsConstructor
public class ResultatExamenLaboController {

    private final ResultatExamenLaboService service;


    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','LABORANTIN')")
    public ResponseEntity<ApiResponse<Page<ResultatExamenLaboDto.Response>>> all(
            @RequestParam(defaultValue = GenericUtils.PAGE) int page,
            @RequestParam(defaultValue = GenericUtils.SIZE) int size) {
        return ResponseEntity.ok(ApiResponse.ok(service.all(page, size)));
    }
    @GetMapping("/examen/{examenId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','LABORANTIN')")
    public ResponseEntity<ApiResponse<ResultatExamenLaboDto.Response>> findByExamen(
            @PathVariable UUID examenId ) {
        return ResponseEntity.ok(ApiResponse.ok(service.findByExamen(examenId)));
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','LABORANTIN')")
    public ResponseEntity<ApiResponse<ResultatExamenLaboDto.Response>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(service.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','LABORANTIN')")
    public ResponseEntity<ApiResponse<ResultatExamenLaboDto.Response>> create(
            @Valid @RequestBody ResultatExamenLaboDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','LABORANTIN')")
    public ResponseEntity<ApiResponse<ResultatExamenLaboDto.Response>> edit(
            @PathVariable UUID id,
            @Valid @RequestBody ResultatExamenLaboDto.Request req) {
        return ResponseEntity.ok(ApiResponse.ok(service.edit(id, req)));
    }



    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','LABORANTIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Examen supprimé", null));
    }
}