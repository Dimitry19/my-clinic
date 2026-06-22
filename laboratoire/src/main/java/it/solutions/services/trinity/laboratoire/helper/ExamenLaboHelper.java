package it.solutions.services.trinity.laboratoire.helper;

import it.solutions.services.trinity.contracts.dto.EmployeDto;
import it.solutions.services.trinity.contracts.dto.ExamenLaboDto;
import it.solutions.services.trinity.contracts.entities.PatientLight;
import it.solutions.services.trinity.contracts.port.EmployeLookupPort;
import it.solutions.services.trinity.contracts.port.PatientLookupPort;
import it.solutions.services.trinity.core.helpers.CoreHelper;
import it.solutions.services.trinity.core.security.services.UserService;
import it.solutions.services.trinity.core.shared.dao.UserDao;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.enums.StatutExamenLabo;
import it.solutions.services.trinity.core.shared.utils.GenericUtils;
import it.solutions.services.trinity.laboratoire.dao.ExamenLaboDao;
import it.solutions.services.trinity.laboratoire.entities.ExamenLabo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class ExamenLaboHelper extends CoreHelper {

    private final ExamenLaboDao dao;
    private final EmployeLookupPort employeLookupPort;
    private final PatientLookupPort patientLookupPort;
    private final UserService userService;

    public ExamenLaboHelper(UserDao userDao, ExamenLaboDao dao,UserService userService,PatientLookupPort patientLookupPort,EmployeLookupPort employeLookupPort) {
        super(userDao);
        this.dao = dao;
        this.userService = userService;
        this.employeLookupPort = employeLookupPort;
        this.patientLookupPort = patientLookupPort;
    }


    public EmployeDto.Response checkMedecin(UUID id){
        return employeLookupPort.findById(id);
    }

    public EmployeDto.Response findEmployeByUtilisateur(UUID userId){
        return employeLookupPort.findEmployeByUtilisateur(userId);
    }

    public ExamenLabo findOrThrow(UUID id) {
        return dao.findByIdFetch(id)
                .orElseThrow(() -> new EntityNotFoundException("Examen introuvable "));
    }

    public ExamenLabo builder(ExamenLaboDto.Request req) {
        User prescripteur = userService.findById(checkMedecin(req.getPrescritPar()).getUtilisateurId());

        return ExamenLabo.builder()
                .consultationId(req.getConsultationId())
                .patientId(req.getPatientId())
                .prescritPar(prescripteur)
                .typeExamen(req.getTypeExamen())
                .description(req.getDescription())
                .statut(req.getStatut() != null ? req.getStatut() : StatutExamenLabo.EN_ATTENTE)
                .datePrescription(req.getDatePrescription() != null
                        ? req.getDatePrescription()
                        : LocalDateTime.now())
                .dateResultat(req.getDateResultat())
                .build();
    }
    public ExamenLaboDto.Response toResponse(ExamenLabo e) {
        PatientLight patient=patientLookupPort.findPatientLight(e.getPatientId());
        User u = e.getPrescritPar();
        return ExamenLaboDto.Response.builder()
                .id(e.getId())
                .consultationId(e.getConsultationId())
                .patientId(e.getPatientId())
                .patientNom(u != null ? GenericUtils.formatNomPrenom(patient.getNom(),patient.getPrenom()) : "—")
                .prescritParId(u != null ? u.getId() : null)
                .prescritParNom(u != null ? GenericUtils.formatNomPrenom(u.getNom(),u.getPrenom()) : "—")
                .typeExamen(e.getTypeExamen())
                .description(e.getDescription())
                .statut(e.getStatut().name())
                .datePrescription(e.getDatePrescription())
                .dateResultat(e.getDateResultat())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
