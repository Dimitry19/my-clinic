package it.solutions.services.trinity.core.shared.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum GroupeSanguin {
    A_P("A+"),
    A_N("A-"),
    B_P("B+"),
    B_N("B-"),
    AB_P("AB+"),
    AB_N("AB-"),
    O_P("O+"),
    O_N("O-");

    private final String libelle;

    GroupeSanguin(String libelle) {
        this.libelle = libelle;
    }


    @JsonValue
    public String getLibelle() {
        return libelle;
    }

    @JsonCreator
    public static GroupeSanguin from(String value) {
        return Arrays.stream(values())
                .filter(g -> g.libelle.equals(value))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("Groupe sanguin invalide: " + value+ " valeurs valides [A+, A-, B+, B-,AB+,AB-,O+,O-]"));



}


}
