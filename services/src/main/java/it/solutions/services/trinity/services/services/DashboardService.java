package it.solutions.services.trinity.services.services;

import it.solutions.services.trinity.agenda.services.AgendaService;
import it.solutions.services.trinity.contracts.dto.AgendaDto;
import it.solutions.services.trinity.core.shared.enums.StatutConsultation;
import it.solutions.services.trinity.core.shared.enums.StatutRendezVous;
import it.solutions.services.trinity.patient.services.ConsultationService;
import it.solutions.services.trinity.services.controllers.out.RendezVous;
import it.solutions.services.trinity.services.controllers.out.StatDashboard;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AgendaService agendaService;
    private final ConsultationService consultationService;

    public StatDashboard stats(@NotNull String email){

        long consultationsTerminees=consultationService.findAllByStatusAndDoctor(email,StatutConsultation.TERMINEE, 0,10).getTotalElements();
        int rdvRestants=agendaService.findAgendaToday(email).size();
        return StatDashboard.builder()
                .patientsAujourdhui(5)
                .consultationsTerminees(consultationsTerminees)
                .enAttente(2)
                .rdvRestants(rdvRestants).build();

    }

    public List<AgendaDto.Response> rendezVous(@NotNull String email){
        return agendaService.findAgendaToday(email);
    }

    public List<Integer> chart() {

        return List.of(8, 12, 9, 15, 11, 6, 30);
    }
}
