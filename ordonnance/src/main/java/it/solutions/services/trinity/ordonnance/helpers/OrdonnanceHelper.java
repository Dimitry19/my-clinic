package it.solutions.services.trinity.ordonnance.helpers;

import it.solutions.services.trinity.contracts.dto.EmployeDto;
import it.solutions.services.trinity.contracts.dto.OrdonnanceDto;
import it.solutions.services.trinity.contracts.entities.ConsultationLight;
import it.solutions.services.trinity.contracts.entities.PatientLight;
import it.solutions.services.trinity.contracts.port.ConsultationLookupPort;
import it.solutions.services.trinity.contracts.port.EmployeLookupPort;
import it.solutions.services.trinity.contracts.port.PatientLookupPort;
import it.solutions.services.trinity.core.helpers.CoreHelper;
import it.solutions.services.trinity.core.shared.dao.UserDao;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.entities.UserLight;
import it.solutions.services.trinity.core.shared.utils.GenericUtils;

import it.solutions.services.trinity.ordonnance.dao.OrdonnanceDao;
import it.solutions.services.trinity.ordonnance.entities.Ordonnance;
import it.solutions.services.trinity.ordonnance.entities.OrdonnanceMedicament;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component

public class OrdonnanceHelper extends CoreHelper{


    private final OrdonnanceDao dao;
    private final EmployeLookupPort employeLookupPort;
    private final ConsultationLookupPort consultationLookupPort;
    private final PatientLookupPort patientLookupPort;


    public OrdonnanceHelper(UserDao userDao, OrdonnanceDao dao,ConsultationLookupPort consultationLookupPort,   EmployeLookupPort employeLookupPort, PatientLookupPort patientLookupPort) {
        super(userDao);
        this.dao = dao;
        this.consultationLookupPort = consultationLookupPort;
        this.employeLookupPort = employeLookupPort;
        this.patientLookupPort = patientLookupPort;
    }


    @Transactional(readOnly = true)
    public Ordonnance findOrThrow(UUID id) {
        return dao.findByIdFetch(id)
                .orElseThrow(() -> new EntityNotFoundException("Ordonnance introuvable "));
    }


    public EmployeDto.Response checkMedecin(UUID id){
        return employeLookupPort.findById(id);
    }

    public UserLight findUtilisateurByEmploye(UUID medecinId,boolean isEdit){
        if(isEdit)    return userDao.findUserLight( medecinId).orElseThrow(() -> new EntityNotFoundException("Médecin introuvable "));

        return userDao.findUserLight( employeLookupPort.findById(medecinId).getUtilisateurId()).orElseThrow(() -> new EntityNotFoundException("Médecin introuvable "));

    }

    private OrdonnanceMedicament buildMedicamentLigne(OrdonnanceDto.MedicamentLigneDto dto) {
        return OrdonnanceMedicament.builder()
                .medicamentNom(dto.getMedicamentNom())
                .dosage(dto.getDosage())
                .frequence(dto.getFrequence())
                .duree(dto.getDuree())
                .instructions(dto.getInstructions())
                .build();
    }

    public Ordonnance builder(OrdonnanceDto.Request req) {
        ConsultationLight cons=consultationLookupPort.findConsultationLight(req.getConsultationId());
        PatientLight patientLight=patientLookupPort.findPatientLight(req.getPatientId());

        UserLight medecin=findUtilisateurByEmploye(req.getMedecinId(), false);

        Ordonnance ordonnance = Ordonnance.builder()
                .consultation(cons)
                .patient(patientLight)
                .medecin(medecin)
                .dateEmission(req.getDateEmission() != null
                        ? req.getDateEmission() : LocalDateTime.now())
                .validiteJours(req.getValiditeJours() != null
                        ? req.getValiditeJours() : 30)
                .instructions(req.getInstructions())
                .build();

        // Ajouter les médicaments via le helper (maintient la relation bidirectionnelle)
        if (req.getMedicaments() != null) {
            req.getMedicaments().forEach(m ->
                    ordonnance.addMedicament(buildMedicamentLigne(m))
            );
        }

        return ordonnance;
    }

    public List<OrdonnanceDto.MedicamentLigneDto> builderMedicaments(Ordonnance o) {
        return o.getMedicaments() != null
                ? o.getMedicaments().stream()
                .map(m -> new OrdonnanceDto.MedicamentLigneDto(
                        m.getMedicamentNom(),
                        m.getDosage(),
                        m.getFrequence(),
                        m.getDuree(),
                        m.getInstructions()
                ))
                .toList()
                : List.of();

    }

    public Ordonnance update(Ordonnance ordonnance , OrdonnanceDto.Request req) {


        ConsultationLight cons=consultationLookupPort.findConsultationLight(req.getConsultationId());
        PatientLight patientLight=patientLookupPort.findPatientLight(req.getPatientId());
        UserLight medecin=findUtilisateurByEmploye(req.getMedecinId(), true);

        ordonnance.setDateEmission(req.getDateEmission() != null
                ? req.getDateEmission() : ordonnance.getDateEmission());
        ordonnance.setValiditeJours(req.getValiditeJours());
        ordonnance.setInstructions(req.getInstructions());
        ordonnance.setMedecin(medecin);
        // Remplacer les médicaments — orphanRemoval = true supprime les anciens
        ordonnance.clearMedicaments();
        if (req.getMedicaments() != null) {
            req.getMedicaments().forEach(m ->
                    ordonnance.addMedicament(buildMedicamentLigne(m))
            );
        }

        return ordonnance;
    }

    public OrdonnanceDto.Response toResponse(Ordonnance o) {
        PatientLight patient =  o.getPatient();

        UserLight user=o.getMedecin();

        employeLookupPort.findEmployeByUtilisateur(user.getId());


        String nom = GenericUtils.normalizeUpper(user.getNom());
        String prenom = GenericUtils.normalize(user.getPrenom());

        String patientNom = GenericUtils.normalizeUpper(patient.getNom());
        String patientPrenom = GenericUtils.normalize(patient.getPrenom());
        return OrdonnanceDto.Response.builder()
                .id(o.getId())
                .patientId(o.getPatient().getId())
                .patientNom(GenericUtils.formatNomPrenom(patientNom,patientPrenom))
                .medecinId(o.getMedecin().getId())
                .medecinNom(GenericUtils.formatNomPrenom(nom,prenom))
                .dateEmission(o.getDateEmission())
                .validiteJours(o.getValiditeJours())
                .instructions(o.getInstructions())
                .createdAt(o.getCreatedAt())
                .expiree(GenericUtils.isExpiree(o.getDateEmission(),o.getValiditeJours()))
                .medicaments(builderMedicaments(o))
                .build();
    }
}
