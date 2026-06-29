package it.solutions.services.trinity.facturation.services;

import it.solutions.services.trinity.contracts.dto.FactureDto;
import it.solutions.services.trinity.contracts.dto.PaiementDto;
import it.solutions.services.trinity.core.security.services.UserService;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.enums.StatutFacture;

import it.solutions.services.trinity.facturation.dao.FactureDao;

import it.solutions.services.trinity.facturation.dao.PaiementDao;
import it.solutions.services.trinity.facturation.entities.Facture;
import it.solutions.services.trinity.facturation.entities.Paiement;
import it.solutions.services.trinity.facturation.helpers.FactureHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FactureService {

    private static final Sort SORT_BY_NUM_FACT = Sort.by("numeroFacture").ascending();
    private final FactureHelper helper;
    private final FactureDao dao;
    private final PaiementDao paiementDao;
    private final UserService userService;

    // ── Lecture ───────────────────────────────────────────
    @Transactional(readOnly = true)
    public Page<FactureDto.Response> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UUID> idsPage = dao.findAllIds(pageable);
        if (idsPage.isEmpty()) return Page.empty(pageable);
        return new PageImpl<>(
                helper.chargerFacturesCompletes(idsPage.getContent()).stream().map(helper::toResponse).toList(),
                pageable,
                idsPage.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public Page<FactureDto.Response> findByStatut(StatutFacture statut, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UUID> idsPage = dao.findIdsByStatut(statut, pageable);
        if (idsPage.isEmpty()) return Page.empty(pageable);
        return new PageImpl<>(
                helper.chargerFacturesCompletes(idsPage.getContent()).stream().map(helper::toResponse).toList(),
                pageable,
                idsPage.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public Page<FactureDto.Response> findByPatient(UUID patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UUID> idsPage = dao.findIdsByPatientId(patientId, pageable);
        List<UUID> ids = idsPage.getContent();

        if (ids.isEmpty()) return Page.empty(pageable);

        return new PageImpl<>(
                helper.chargerFacturesCompletes(ids).stream().map(helper::toResponse).toList(),
                pageable,
                idsPage.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public FactureDto.Response findById(UUID id) {
        return helper.toResponse(helper.findOrThrow(id));
    }

    // ── Création ──────────────────────────────────────────
    @Transactional
    public FactureDto.Response create(FactureDto.Request req) {
        return helper.toResponse(dao.save(helper.builder(req)));
    }

    // ── Modification ──────────────────────────────────────
    @Transactional
    public FactureDto.Response edit(UUID id, FactureDto.Request req) {


        Facture facture =helper.findOrThrow(id);
        return helper.toResponse(dao.save(helper.update(facture,req)));
    }

    // ── Changement de statut ──────────────────────────────
    @Transactional
    public FactureDto.Response changeStatut(UUID id, FactureDto.StatutRequest req) {
        Facture facture = helper.findOrThrow(id);
        facture.setStatut(req.getStatut());
        return helper.toResponse(dao.save(facture));
    }

    // ── Enregistrement d'un paiement ──────────────────────
    @Transactional
    public FactureDto.Response ajouterPaiement(PaiementDto.Request req) {
        Facture facture = helper.findOrThrow(req.getFactureId());

        if (facture.getStatut() == StatutFacture.ANNULEE) {
            throw new IllegalStateException("Impossible d'encaisser une facture annulée");
        }

        // Vérifier que le paiement ne dépasse pas le reste à payer
        BigDecimal resteAPayer = facture.getMontantTotal()
                .subtract(facture.getMontantPaye());
        if (req.getMontant().compareTo(resteAPayer) > 0) {
            throw new IllegalArgumentException(
                    "Le montant (" + req.getMontant() + ") dépasse le reste à payer (" + resteAPayer + ")");
        }

        User encaisseur = req.getEncaisseParId() != null
                ? userService.findById(req.getEncaisseParId()) : null;

        Paiement paiement = Paiement.builder()
                .montant(req.getMontant())
                .modePaiement(req.getModePaiement())
                .reference(req.getReference())
                .datePaiement(req.getDatePaiement() != null
                        ? req.getDatePaiement() : LocalDateTime.now())
                .encaissePar(encaisseur)
                .build();

        facture.addPaiement(paiement);
        facture.recalculerStatut();

        return helper.toResponse(dao.save(facture));
    }

    // ── Suppression ───────────────────────────────────────
    @Transactional
    public void delete(UUID id) {
        Facture facture = helper.findOrThrow(id);
        if (facture.getStatut() == StatutFacture.PAYEE) {
            throw new IllegalStateException("Impossible de supprimer une facture payée");
        }
        dao.deleteById(id);
    }

}