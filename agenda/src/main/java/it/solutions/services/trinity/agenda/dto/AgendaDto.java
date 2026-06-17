package it.solutions.services.trinity.agenda.dto;



import it.solutions.services.trinity.core.shared.enums.StatutRendezVous;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

public class AgendaDto {



    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class StatusRequest {
        private StatutRendezVous statut;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Request {
        private UUID patientId;
        private UUID medecinId;
        private LocalDateTime  dateHeure;
        private int dureeMinutes;
        private String motif;
        private String notes;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private UUID id;
        private UUID patientId;
        private String patientNom;
        private String patientPrenom;
        private UUID medecinId;
        private String medecinNom;
        private LocalDateTime dateHeure;
        private Integer dureeMinutes;
        private String motif;
        private String statut;
        private String notes;

    }
}
