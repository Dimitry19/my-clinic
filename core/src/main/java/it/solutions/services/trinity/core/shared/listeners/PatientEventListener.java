package it.solutions.services.trinity.core.shared.listeners;

import java.util.UUID;

public interface PatientEventListener {
    void onMedecinStatusChanged(UUID medecinId, boolean actif);
}
