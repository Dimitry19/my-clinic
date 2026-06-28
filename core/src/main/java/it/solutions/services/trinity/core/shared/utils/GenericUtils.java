package it.solutions.services.trinity.core.shared.utils;

import java.time.LocalDateTime;
import java.util.stream.Stream;

public class GenericUtils {

    public static final String PAGE="0";
    public static final String SIZE="20";

    public static String formatNomPrenom(String nom, String prenom) {
        return Stream.of(nom, prenom)
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .reduce((a, b) -> a + " " + b)
                .orElse("");
    }

    public static String normalize(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    public static String normalizeUpper(String value) {
        String v = normalize(value);
        return v == null ? null : v.toUpperCase();
    }

    public static boolean isFutureDate(LocalDateTime dateHeure){
        return  !dateHeure.isBefore(LocalDateTime.now());

    }

    public static boolean isExpiree(LocalDateTime dateEmission,Integer validiteJours) {
        if (dateEmission == null || validiteJours == null) {
            return false;
        }

        return dateEmission
                .plusDays(validiteJours)
                .isBefore(LocalDateTime.now());
    }
}
