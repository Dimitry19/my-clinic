package it.solutions.services.trinity.employe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class CongeDto {


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private UUID id;
        private String typeConge;
        private LocalDate dateDebut;
        private LocalDate dateFin;
        private long duree;
        private String motif;
        private String statut;
        private String primes;
        private String approuvePar;

    }
}
