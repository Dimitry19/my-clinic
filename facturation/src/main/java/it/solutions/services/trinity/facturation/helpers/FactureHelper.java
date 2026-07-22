package it.solutions.services.trinity.facturation.helpers;

import it.solutions.services.trinity.contracts.dto.EmployeDto;
import it.solutions.services.trinity.contracts.dto.FactureDto;
import it.solutions.services.trinity.contracts.dto.PaiementDto;
import it.solutions.services.trinity.contracts.entities.ConsultationLight;
import it.solutions.services.trinity.contracts.entities.PatientLight;
import it.solutions.services.trinity.contracts.port.ConsultationLookupPort;
import it.solutions.services.trinity.contracts.port.EmployeLookupPort;
import it.solutions.services.trinity.contracts.port.PatientLookupPort;
import it.solutions.services.trinity.core.exception.ValidationException;
import it.solutions.services.trinity.core.helpers.CoreHelper;
import it.solutions.services.trinity.core.shared.dao.UserDao;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.entities.UserLight;
import it.solutions.services.trinity.core.shared.enums.StatutFacture;
import it.solutions.services.trinity.core.shared.utils.GenericUtils;
import it.solutions.services.trinity.facturation.dao.FactureDao;
import it.solutions.services.trinity.facturation.entities.Facture;
import it.solutions.services.trinity.facturation.entities.FactureLigne;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Component

public class FactureHelper extends CoreHelper{


    private final FactureDao dao;
    private final EmployeLookupPort employeLookupPort;
    private final ConsultationLookupPort consultationLookupPort;
    private final PatientLookupPort patientLookupPort;


    public FactureHelper(UserDao userDao, FactureDao dao, ConsultationLookupPort consultationLookupPort, EmployeLookupPort employeLookupPort, PatientLookupPort patientLookupPort) {
        super(userDao);
        this.dao = dao;
        this.consultationLookupPort = consultationLookupPort;
        this.employeLookupPort = employeLookupPort;
        this.patientLookupPort = patientLookupPort;
    }


    @Transactional(readOnly = true)
    public Facture findOrThrow(UUID id) {
        return dao.findByIdWithLignes(id)
                .orElseThrow(() -> new EntityNotFoundException("Facture introuvable "));
    }


    public EmployeDto.Response checkMedecin(UUID id){
        return employeLookupPort.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Facture> chargerFacturesCompletes(List<UUID> ids) {
        // Passe 1 : lignes + patient + consultation
        List<Facture> factures = dao.findWithLignesByIds(ids);

        // Passe 2 : enrichir avec les paiements
        Map<UUID, Facture> factureMap = factures.stream()
                .collect(Collectors.toMap(Facture::getId, f -> f));

        dao.findWithPaiementsByIds(ids).forEach(fp ->
                Optional.ofNullable(factureMap.get(fp.getId()))
                        .ifPresent(f -> f.getPaiements().addAll(fp.getPaiements()))
        );

        // Remettre dans l'ordre des IDs originaux
        return ids.stream()
                .map(factureMap::get)
                .filter(Objects::nonNull)
                .toList();
    }



    public Facture builder(FactureDto.Request req) {
        ConsultationLight cons=req.getConsultationId()!=null?consultationLookupPort.findConsultationLight(req.getConsultationId()):null;
        PatientLight patientLight=patientLookupPort.findPatientLight(req.getPatientId());

        Facture facture = Facture.builder()
                .consultation(cons)
                .patient(patientLight)
                .numeroFacture(genererNumero())
                .montantPaye(BigDecimal.ZERO)
                .dateEmission(req.getDateEmission() != null
                        ? req.getDateEmission() : LocalDateTime.now())
                .statut(StatutFacture.IMPAYEE)
                .notes(req.getNotes())
                .build();

        req.getLignes().forEach(l -> facture.addLigne(buildLigne(l)));
        facture.recalculerMontantTotal();

        return facture;
    }



    public Facture update(Facture facture , FactureDto.Request req) {
        ConsultationLight cons=req.getConsultationId()!=null?consultationLookupPort.findConsultationLight(req.getConsultationId()):null;
        if (facture.getStatut() == StatutFacture.PAYEE ||
                facture.getStatut() == StatutFacture.ANNULEE) {
            throw new ValidationException(
                    "Impossible de modifier une facture " + facture.getStatut().name());
        }

        facture.setNotes(req.getNotes());
        facture.setDateEmission(req.getDateEmission() != null
                ? req.getDateEmission() : facture.getDateEmission());
        facture.setConsultation(cons);

        facture.clearLignes();
        req.getLignes().forEach(l -> facture.addLigne(buildLigne(l)));
        facture.recalculerMontantTotal();
        facture.recalculerStatut();

         return facture;
    }

    public   FactureDto.Response toResponse(Facture f) {
        BigDecimal resteAPayer = f.getMontantPaye()!=null ?f.getMontantTotal().subtract(f.getMontantPaye()):f.getMontantTotal();
        PatientLight patient=f.getPatient();
        if(patient==null){
            throw new ValidationException(
                    "Impossible de trouver le patient associé à la facture " + f.getNumeroFacture());
        }

        return FactureDto.Response.builder()
                .id(f.getId())
                .patientId(patient.getId())
                .patientNom(GenericUtils.formatNomPrenom(patient.getNom(), patient.getPrenom()))
                .consultationId(f.getConsultation()!=null?f.getConsultation().getId():null)
                .numeroFacture(f.getNumeroFacture())
                .dateEmission(f.getDateEmission())
                .montantTotal(f.getMontantTotal())
                .montantPaye(f.getMontantPaye())
                .resteAPayer(resteAPayer.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : resteAPayer)
                .statut(f.getStatut().name())
                .notes(f.getNotes())
                .pdfPath(f.getPdfPath())
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .lignes(f.getLignes().stream().map(l ->
                        FactureDto.LigneResponse.builder()
                                .id(l.getId())
                                .description(l.getDescription())
                                .quantite(l.getQuantite())
                                .prixUnitaire(l.getPrixUnitaire())
                                .total(l.getTotal())
                                .build()
                ).toList())
                .paiements(f.getPaiements().stream().map(p -> {
                    User enc = p.getEncaissePar();
                    return PaiementDto.Response.builder()
                            .id(p.getId())
                            .factureId(f.getId())
                            .montant(p.getMontant())
                            .modePaiement(p.getModePaiement().name())
                            .reference(p.getReference())
                            .datePaiement(p.getDatePaiement())
                            .encaisseParId(enc != null ? enc.getId() : null)
                            .encaisseParNom(enc != null ? enc.getPrenom() + " " + enc.getNom() : null)
                            .createdAt(p.getCreatedAt())
                            .build();
                }).toList())
                .build();
    }


    private FactureLigne buildLigne(FactureDto.LigneRequest req) {
        BigDecimal total = req.getPrixUnitaire()
                .multiply(BigDecimal.valueOf(req.getQuantite()));
        return FactureLigne.builder()
                .description(req.getDescription())
                .quantite(req.getQuantite())
                .prixUnitaire(req.getPrixUnitaire())
                .total(total)
                .build();
    }
    private String genererNumero() {
        String prefix = "FACT-" + DateTimeFormatter.ofPattern("yyyyMM").format(LocalDateTime.now()) + "-";
        String suffix = String.valueOf(System.currentTimeMillis()).substring(8);
        String numero = prefix + suffix;
        // S'assurer de l'unicité
        while (dao.existsByNumeroFacture(numero)) {
            suffix = String.valueOf(System.currentTimeMillis()).substring(7);
            numero = prefix + suffix;
        }
        return numero;
    }
}
