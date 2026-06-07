package it.solutions.services.trinity.services.services;

import it.solutions.services.trinity.core.shared.enums.StatutRendezVous;
import it.solutions.services.trinity.services.controllers.out.RendezVous;
import it.solutions.services.trinity.services.controllers.out.StatDashboard;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {

    public StatDashboard stats(){

        return StatDashboard.builder()
                .patientsAujourdhui(5)
                .consultationsTerminees(3)
                .enAttente(2)
                .rdvRestants(6).build();

    }

    public List<RendezVous> rendezVous(){

        List<RendezVous> rendezVous=new ArrayList<>();

        rendezVous.add(RendezVous.builder()
                .id("5b1227a1-ee78-45c1-859e-71b32d4b9045")
                .motif("Visite mensuelle")
                .dateHeure(LocalDateTime.now())
                .dureeMinutes("45")
                .patientNom("GENNESIS")
                .patientPrenom("Lucie-Rachel")
                .statut(StatutRendezVous.CONFIRME)
                .medecinNom("Kaizer Franck").build());
        rendezVous.add(RendezVous.builder()
                .id("e81e6f73-b8e7-43b8-917a-b2788ba5596c")
                .motif("Visite de controle")
                .dateHeure(LocalDateTime.now())
                .dureeMinutes("45")
                .patientNom("KAMDEM")
                .patientPrenom("Gerard")
                .statut(StatutRendezVous.PLANIFIE)
                .medecinNom("Kaizer Franck").build());
        return rendezVous;
    }

    public List<Integer> chart() {

        return List.of(8, 12, 9, 15, 11, 6, 30);
    }
}
