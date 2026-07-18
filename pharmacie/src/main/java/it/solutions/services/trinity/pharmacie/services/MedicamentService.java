package it.solutions.services.trinity.pharmacie.services;


import it.solutions.services.trinity.contracts.dto.EmployeDto;
import it.solutions.services.trinity.contracts.dto.MedicamentDto;
import it.solutions.services.trinity.core.security.filters.JwtAuthFilter;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.enums.Role;
import it.solutions.services.trinity.core.shared.enums.StatutConsultation;
import it.solutions.services.trinity.contracts.dto.ConsultationDto;
import it.solutions.services.trinity.core.shared.enums.StatutStock;
import it.solutions.services.trinity.pharmacie.dao.MedicamentDao;
import it.solutions.services.trinity.pharmacie.entities.Medicament;
import it.solutions.services.trinity.pharmacie.helpers.MedicamentHelper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;



@Service
@RequiredArgsConstructor
public class MedicamentService {
    private static final Logger log = LoggerFactory.getLogger(MedicamentService.class);


    private static final Sort SORT_BY_NOM = Sort.by("nom").ascending();
    private final MedicamentDao dao;
    private final MedicamentHelper helper;


    public Page<MedicamentDto.Response> search(int page, int size, String search, Boolean actif) {
        Pageable pageable = PageRequest.of(page, size, SORT_BY_NOM);
        return dao.search(search, actif, pageable).map(helper::toResponse);
    }

    @Cacheable(value = "medicaments", key = "#id")
    public MedicamentDto.Response findById(UUID id) {
        return helper.toResponse(helper.getOrThrow(id));
    }

    @Transactional
    public MedicamentDto.Response create(MedicamentDto.Request req) {
        return helper.toResponse(dao.save(helper.builder(req)));
    }

    @Transactional
    @CacheEvict(value = "medicaments", key = "#id")
    public MedicamentDto.Response edit(UUID id, MedicamentDto.Request req) {

        Medicament medicament = helper.getOrThrow(id);
        helper.update(medicament ,req);
        return helper.toResponse(dao.save(medicament));


    }

    @Transactional
    @CacheEvict(value = "medicaments", key = "#id")
    public void delete(UUID id) {
        Medicament m = helper.getOrThrow(id);
        m.setActif(false); // soft delete
        dao.save(m);
    }

    // ── Mouvement de stock ────────────────────────────────
    @Transactional
    @CacheEvict(value = "medicaments", key = "#req.medicamentId")
    public MedicamentDto.Response mouvementStock(MedicamentDto.MouvementRequest req) {
        Medicament m = helper.getOrThrow(req.getMedicamentId());
        int nouveauStock = m.getStockActuel() + req.getQuantite();
        if (nouveauStock < 0) {
            throw new IllegalArgumentException(
                    "Stock insuffisant. Disponible : " + m.getStockActuel() +
                            ", demandé : " + Math.abs(req.getQuantite())
            );
        }
        m.setStockActuel(nouveauStock);
        Medicament saved = dao.save(m);
        log.info("Mouvement stock [{}] {} {} — {} (ref: {})",
                req.getMotif(), req.getQuantite() > 0 ? "+" : "",
                req.getQuantite(), m.getNom(), req.getReference());
        return helper.toResponse(saved);
    }

    // ── Alertes & stats ───────────────────────────────────
    public List<MedicamentDto.Response> getAlertes() {
        return dao.findEnAlerte().stream().map(helper::toResponse).toList();
    }

    public List<MedicamentDto.Response> getRuptures() {
        return dao.findEnRupture().stream().map(helper::toResponse).toList();
    }

    public List<MedicamentDto.Response> getExpirantBientot() {
        return dao.findExpirantAvant(LocalDate.now().plusDays(30))
                .stream().map(helper::toResponse).toList();
    }

    public MedicamentDto.StockStats getStats() {
        return MedicamentDto.StockStats.builder()
                .totalMedicaments(dao.countByActifTrue())
                .disponibles(dao.countDisponibles())
                .alertes(dao.countAlertes())
                .ruptures(dao.countRuptures())
                .expires(dao.countExpires())
                .expireBientot(dao.countExpirantBientot(LocalDate.now().plusDays(30)))
                .build();
    }

    // ── CRON : log des alertes chaque matin à 8h ─────────
    @Scheduled(cron = "0 0 8 * * *")
    public void verifierAlertes() {
        long alertes  = dao.countAlertes();
        long ruptures = dao.countRuptures();
        if (alertes > 0 || ruptures > 0) {
            log.warn("PHARMACIE — {} médicament(s) en alerte, {} en rupture", alertes, ruptures);
        }
    }
}
