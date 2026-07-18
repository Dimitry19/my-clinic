package it.solutions.services.trinity.pharmacie.helpers;

import it.solutions.services.trinity.contracts.dto.MedicamentDto;
import it.solutions.services.trinity.core.helpers.CoreHelper;
import it.solutions.services.trinity.core.shared.dao.UserDao;
import it.solutions.services.trinity.core.shared.enums.StatutStock;

import it.solutions.services.trinity.pharmacie.dao.MedicamentDao;
import it.solutions.services.trinity.pharmacie.entities.Medicament;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class MedicamentHelper extends CoreHelper{


    private final MedicamentDao dao;


    public MedicamentHelper(UserDao userDao, MedicamentDao dao) {
        super(userDao);
        this.dao = dao;

    }

    public Medicament getOrThrow(UUID id) {
        return dao.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Médicament introuvable " ));
    }


    public Medicament builder(MedicamentDto.Request req) {
        return Medicament.builder()
                .nom(req.getNom().trim())
                .denomination(req.getDenomination())
                .forme(req.getForme())
                .dosageUnitaire(req.getDosageUnitaire())
                .stockActuel(req.getStockActuel() != null ? req.getStockActuel() : 0)
                .stockMinimum(req.getStockMinimum() != null ? req.getStockMinimum() : 10)
                .prixUnitaire(req.getPrixUnitaire())
                .fournisseur(req.getFournisseur())
                .dateExpiration(req.getDateExpiration())
                .actif(req.isActif())
                .build();
    }

    public Medicament update(Medicament m , MedicamentDto.Request req) {

        m.setNom(req.getNom().trim());
        m.setDenomination(req.getDenomination());
        m.setForme(req.getForme());
        m.setDosageUnitaire(req.getDosageUnitaire());
        if (req.getStockMinimum() != null) m.setStockMinimum(req.getStockMinimum());
        m.setPrixUnitaire(req.getPrixUnitaire());
        m.setFournisseur(req.getFournisseur());
        m.setDateExpiration(req.getDateExpiration());
        m.setActif(req.isActif());
        return m;
    }

    public MedicamentDto.Response toResponse(Medicament m) {
        int manquant = (m.getStatutStock() == StatutStock.ALERTE || m.getStatutStock() == StatutStock.RUPTURE)
                ? Math.max(0, m.getStockMinimum() - m.getStockActuel()) : 0;
        return MedicamentDto.Response.builder()
                .id(m.getId())
                .nom(m.getNom())
                .denomination(m.getDenomination())
                .forme(m.getForme())
                .dosageUnitaire(m.getDosageUnitaire())
                .stockActuel(m.getStockActuel())
                .stockMinimum(m.getStockMinimum())
                .prixUnitaire(m.getPrixUnitaire())
                .fournisseur(m.getFournisseur())
                .dateExpiration(m.getDateExpiration())
                .actif(m.getActif())
                .statutStock(m.getStatutStock())
                .expire(m.isExpire())
                .expireBientot(m.isExpireBientot())
                .manquant(manquant)
                .build();
    }
}
