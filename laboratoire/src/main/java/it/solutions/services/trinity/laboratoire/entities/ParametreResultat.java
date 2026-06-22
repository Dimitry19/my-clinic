package it.solutions.services.trinity.laboratoire.entities;

public record ParametreResultat(
        String libelle,
        String valeur,
        String unite,
        String norme,
        boolean anormal
) {}