package it.solutions.services.trinity.core.shared.enums;

public enum Genre {

    M("HOMME"),
    F("FEMME"),
    AUTRE("AUTRE");

    private final String libelle;

    Genre(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}
