package it.solutions.services.trinity.core.shared.events.employe;

import java.util.UUID;

public record EmployeStatusChangedEvent(UUID employeId, UUID utilisateurId, boolean actif) {
}
