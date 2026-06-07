package it.solutions.services.trinity.services.controllers.out;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatDashboard {

    private int patientsAujourdhui;
    private int enAttente;
    private int rdvRestants;
    private int consultationsTerminees;

}
