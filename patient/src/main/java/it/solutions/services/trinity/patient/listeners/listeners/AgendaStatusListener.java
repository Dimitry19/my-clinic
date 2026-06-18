package it.solutions.services.trinity.patient.listeners.listeners;



import it.solutions.services.trinity.core.shared.enums.StatutRendezVous;
import it.solutions.services.trinity.core.shared.events.agenda.AgendaStatusChangedEvent;
import it.solutions.services.trinity.patient.services.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;



@Component
@RequiredArgsConstructor
public class AgendaStatusListener {

    private final ConsultationService consultationService;

    // AFTER_COMMIT : ne réagit que si la transaction de changeStatus()
    // a vraiment été validée en base. Évite de traiter un événement
    // "fantôme" si un rollback survient après la publication.
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onAgendaStatusChanged(AgendaStatusChangedEvent event) {

        if (StatutRendezVous.A_REASSIGNER.equals(event.status())) {
            consultationService.marquerConsultationAPlanifier(event.id());
        }
    }
}