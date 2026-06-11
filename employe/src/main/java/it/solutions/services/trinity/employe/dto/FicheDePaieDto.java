package it.solutions.services.trinity.employe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

import java.util.UUID;

public class FicheDePaieDto {


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private UUID id;
        private int mois;
        private int annee;
        private BigDecimal salaireBrut;
        private BigDecimal cotisations;
        private BigDecimal primes;
        private BigDecimal retenues;
        private BigDecimal salaireNet;
        private String pdfPath;

    }
}
