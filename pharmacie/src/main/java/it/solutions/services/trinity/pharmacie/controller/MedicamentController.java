package it.solutions.services.trinity.pharmacie.controller;

import it.solutions.services.trinity.contracts.dto.MedicamentDto;
import it.solutions.services.trinity.contracts.dto.MedicamentDto.StockStats;
import it.solutions.services.trinity.core.shared.api.ApiResponse;
import it.solutions.services.trinity.contracts.dto.ConsultationDto;
import it.solutions.services.trinity.contracts.dto.PatientDto;
import it.solutions.services.trinity.core.shared.utils.GenericUtils;
import it.solutions.services.trinity.pharmacie.services.MedicamentService;
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
@RequestMapping("/api/pharmacie/medicaments")
@RequiredArgsConstructor
public class MedicamentController {


    private final MedicamentService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','INFIRMIER','PHARMACIEN')")
    public ResponseEntity<ApiResponse<Page<MedicamentDto.Response>>> search(
            @RequestParam(name = "q", defaultValue = "") String q,
            @RequestParam(required = false)      Boolean actif,
            @RequestParam(defaultValue = GenericUtils.PAGE) int page,
            @RequestParam(defaultValue = GenericUtils.SIZE) int size) {


        return ResponseEntity.ok(ApiResponse.ok(service.search(page, size,q,actif)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDECIN','INFIRMIER','PHARMACIEN')")
    public ResponseEntity<ApiResponse<MedicamentDto.Response>> findById(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(service.findById(id)));
    }


    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','PHARMACIEN')")
    public ResponseEntity<ApiResponse<MedicamentDto.Response>> create(@Valid @RequestBody MedicamentDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Médicament créé", service.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','PHARMACIEN')")
    public ResponseEntity<ApiResponse<MedicamentDto.Response>> edit(@PathVariable UUID id, @Valid @RequestBody MedicamentDto.Request req) {
        return ResponseEntity.ok(ApiResponse.ok("Médicament modifié", service.edit(id, req)));
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','PHARMACIEN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Médicament supprimé", null));
    }

    // ── Mouvement de stock ────────────────────────────────
    @PostMapping("/mouvement")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','PHARMACIEN')")
    public ResponseEntity<ApiResponse<MedicamentDto.Response>> mouvement(
            @Valid @RequestBody MedicamentDto.MouvementRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Stock mis à jour", service.mouvementStock(req)));
    }

    // ── Alertes & stats ───────────────────────────────────
    @GetMapping("/alertes")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','PHARMACIEN')")
    public ResponseEntity<ApiResponse<List<MedicamentDto.Response>>> alertes() {
        return ResponseEntity.ok(ApiResponse.ok(service.getAlertes()));
    }

    @GetMapping("/ruptures")
    @PreAuthorize("hasAnyRole('ADMIN','MEDECIN','INFIRMIER')")
    public ResponseEntity<ApiResponse<List<MedicamentDto.Response>>> ruptures() {
        return ResponseEntity.ok(ApiResponse.ok(service.getRuptures()));
    }

    @GetMapping("/expirant")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','PHARMACIEN')")
    public ResponseEntity<ApiResponse<List<MedicamentDto.Response>>> expirant() {
        return ResponseEntity.ok(ApiResponse.ok(service.getExpirantBientot()));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','PHARMACIEN')")
    public ResponseEntity<ApiResponse<StockStats>> stats() {
        return ResponseEntity.ok(ApiResponse.ok(service.getStats()));
    }
}