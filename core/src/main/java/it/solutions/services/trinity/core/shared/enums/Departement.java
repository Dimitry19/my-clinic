package it.solutions.services.trinity.core.shared.enums;

public enum Departement {

    MEDECINE("MEDECIN"),
    CHIRURGIE("MEDECIN"),
    LABORATOIRE("LABORANTIN"),
    PHARMACIE("PHARMACIEN"),
    ADMINISTRATION("ADMIN"),
    COMPTABILITE("COMPTABLE"),
    INFIRMERIE("INFIRMIER"),
    URGENCES("URGENTISTE");

    private final String libelle;

    Departement(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}
