package it.solutions.services.trinity.core.shared.enums;

public enum StatutEmploye {

    ACTIF,INACTIF;


    public static boolean isActif(String s) {
        return StatutEmploye.ACTIF.name().equals(s);
    }
}
