package it.solutions.services.trinity.core.shared.events.agenda;

import it.solutions.services.trinity.core.shared.enums.StatutRendezVous;

import java.util.UUID;

public record AgendaStatusChangedEvent(UUID id, StatutRendezVous status) {
}
