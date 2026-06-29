package it.solutions.services.trinity.facturation.controller;

import it.solutions.services.trinity.contracts.dto.FactureDto;
import it.solutions.services.trinity.contracts.dto.PaiementDto;
import it.solutions.services.trinity.core.shared.api.ApiResponse;
import it.solutions.services.trinity.core.shared.enums.StatutFacture;

import it.solutions.services.trinity.core.shared.utils.GenericUtils;
import it.solutions.services.trinity.facturation.services.FactureService;
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
@RequestMapping("/api/factures")
@RequiredArgsConstructor
public class FactureController {

    private final FactureService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','COMPTABLE')")
    public ResponseEntity<ApiResponse<Page<FactureDto.Response>>> findAll(
            @RequestParam(defaultValue = GenericUtils.PAGE) int page,
            @RequestParam(defaultValue = GenericUtils.SIZE) int size,
            @RequestParam(required = false) StatutFacture statut) {
        if (statut != null) {
            return ResponseEntity.ok(ApiResponse.ok(service.findByStatut(statut, page, size)));
        }
        return ResponseEntity.ok(ApiResponse.ok(service.findAll(page, size)));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','RECEPTIONNISTE','PHARMACIEN','COMPTABLE')")
    public ResponseEntity<ApiResponse<Page<FactureDto.Response>>> findByPatient(
            @PathVariable UUID patientId, @RequestParam(defaultValue = GenericUtils.PAGE) int page,
            @RequestParam(defaultValue = GenericUtils.SIZE) int size) {
        return ResponseEntity.ok(ApiResponse.ok(service.findByPatient(patientId,page,size)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','RECEPTIONNISTE', 'COMPTABLE')")
    public ResponseEntity<ApiResponse<FactureDto.Response>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(service.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN', 'COMPTABLE')")
    public ResponseEntity<ApiResponse<FactureDto.Response>> create(
            @Valid @RequestBody FactureDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN', 'COMPTABLE')")
    public ResponseEntity<ApiResponse<FactureDto.Response>> edit(
            @PathVariable UUID id,
            @Valid @RequestBody FactureDto.Request req) {
        return ResponseEntity.ok(ApiResponse.ok(service.edit(id, req)));
    }

    @PatchMapping("/{id}/statut")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','COMPTABLE')")
    public ResponseEntity<ApiResponse<FactureDto.Response>> changeStatut(
            @PathVariable UUID id,
            @Valid @RequestBody FactureDto.StatutRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(service.changeStatut(id, req)));
    }

    @PostMapping("/paiements")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','COMPTABLE')")
    public ResponseEntity<ApiResponse<FactureDto.Response>> ajouterPaiement(
            @Valid @RequestBody PaiementDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.ajouterPaiement(req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','COMPTABLE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Facture supprimée", null));
    }
}