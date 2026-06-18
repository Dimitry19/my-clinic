package it.solutions.services.trinity.agenda.listeners;



import it.solutions.services.trinity.core.shared.events.employe.EmployeStatusChangedEvent;
import it.solutions.services.trinity.agenda.services.AgendaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

@Component
@RequiredArgsConstructor
public class EmployeStatusListener {

    private final AgendaService agendaService;

    // AFTER_COMMIT : ne réagit que si la transaction de changeStatus()
    // a vraiment été validée en base. Évite de traiter un événement
    // "fantôme" si un rollback survient après la publication.
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onEmployeStatusChanged(EmployeStatusChangedEvent event) {
        if (!event.actif()) {
            agendaService.marquerRendezVousAReassigner(event.employeId());
        }
    }
}