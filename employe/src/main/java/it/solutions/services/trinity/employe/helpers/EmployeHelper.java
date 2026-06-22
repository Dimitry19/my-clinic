package it.solutions.services.trinity.employe.helpers;

import it.solutions.services.trinity.core.security.services.UserService;
import it.solutions.services.trinity.core.shared.entities.User;
import it.solutions.services.trinity.core.shared.enums.StatutEmploye;
import it.solutions.services.trinity.core.shared.utils.GenericUtils;
import it.solutions.services.trinity.employe.adapters.EmployeAdapter;
import it.solutions.services.trinity.employe.dao.EmployeDao;
import it.solutions.services.trinity.contracts.dto.EmployeDto;
import it.solutions.services.trinity.employe.entities.Employe;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EmployeHelper {

    private final UserService userService;
    private final EmployeDao dao;


    public Employe findEmployeOrThrow(UUID id) {
        return dao.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employé introuvable : " + id));
    }



    public EmployeDto.Response toResponse(Employe e) {
        User user = e.getUtilisateur();
        if (user == null) {
            throw new IllegalStateException("L'employé " + e.getId() + " n'a pas d'utilisateur associé.");
        }

        return EmployeDto.Response.builder()
                .id(e.getId())
                .nom(e.getNom())
                .prenom(e.getPrenom())
                .poste(e.getPoste())
                .departement(e.getDepartement() != null ? e.getDepartement().name() : null)
                .telephone(e.getTelephone())
                .email(e.getEmail())
                .dateEmbauche(e.getDateEmbauche())
                .salaireBase(e.getSalaireBase())
                .typeContrat(e.getTypeContrat() != null ? e.getTypeContrat().name() : null)
                .numeroCnss(e.getNumeroCnss())
                .rib(e.getRib())
                .utilisateurId(user.getId())
                .statut(e.isActif() ? StatutEmploye.ACTIF.name() : StatutEmploye.INACTIF.name())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Construit un nouvel Employe à partir de la requête, en créant
     * l'utilisateur associé. Centralise ce qui était auparavant dupliqué
     * dans EmployeService.create().
     */
    public Employe buildNewEmploye(EmployeDto.Request req) {
        User user = userService.create(req.getEmail(), req.getRole().name(), req.getNom(), req.getPrenom(), null);

        return Employe.builder()
                .nom(GenericUtils.normalizeUpper(req.getNom()))
                .prenom(GenericUtils.normalize(req.getPrenom()))
                .poste(req.getPoste())
                //.departement(req.getDepartement())
                .telephone(req.getTelephone())
                .email(req.getEmail())
                .dateEmbauche(req.getDateEmbauche())
                .salaireBase(req.getSalaireBase())
                .typeContrat(req.getTypeContrat())
                .numeroCnss(req.getNumeroCnss())
                .rib(req.getRib())
                .actif(true)
                .utilisateur(user)
                .build();
    }

    /**
     * Crée un nouvel utilisateur si l'employé n'en a pas, ou met à jour
     * l'utilisateur existant et le PERSISTE explicitement.
     *
     * IMPORTANT : ne jamais oublier `userService.save(user)` après une
     * modification — sans cet appel, la mise à jour ne survit que si le
     * dirty-checking JPA s'applique dans le même contexte transactionnel,
     * ce qui n'est pas garanti si User est géré par un module séparé.
     */
    public void resolveOrCreateUser(Employe employe, EmployeDto.Request req, String nom, String prenom) {
        if (employe.getUtilisateur() == null) {

            employe.setUtilisateur(userService.create(req.getEmail(), req.getRole().name(), req.getNom(), req.getPrenom(), null));
            return;
        }

        User user = userService.findById(employe.getUtilisateur().getId());
        boolean changed = !Objects.equals(user.getNom(), nom) || !Objects.equals(user.getPrenom(), prenom);

        if (changed) {
            user.setNom(nom);
            user.setPrenom(prenom);
            userService.save(user);
        }
    }

    public void applyEmployeUpdates(Employe employe, EmployeDto.Request req, String nom, String prenom) {
        employe.setNom(nom);
        employe.setPrenom(prenom);
        employe.setPoste(req.getPoste());
        employe.setDepartement(req.getDepartement());
        employe.setTelephone(req.getTelephone());
        employe.setEmail(req.getEmail());
        employe.setDateEmbauche(req.getDateEmbauche());
        employe.setSalaireBase(req.getSalaireBase());
        employe.setTypeContrat(req.getTypeContrat());
        employe.setNumeroCnss(req.getNumeroCnss());
        employe.setRib(req.getRib());
        employe.setActif(req.getStatut() == StatutEmploye.ACTIF);
    }
}