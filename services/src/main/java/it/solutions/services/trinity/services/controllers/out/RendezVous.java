package it.solutions.services.trinity.services.controllers.out;

import it.solutions.services.trinity.core.shared.enums.StatutRendezVous;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder
@NoArgsConstructor
@AllArgsConstructor
public class RendezVous {

    private String id;
    private String patientNom;
    private String patientPrenom;
    private String medecinNom;
    private LocalDateTime dateHeure;
    private String dureeMinutes;
    private String motif;
    @Enumerated(EnumType.STRING)
    private StatutRendezVous statut;
}
