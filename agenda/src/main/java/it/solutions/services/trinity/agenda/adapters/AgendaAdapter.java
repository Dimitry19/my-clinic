package it.solutions.services.trinity.agenda.adapters;


import it.solutions.services.trinity.agenda.dao.AgendaDao;
import it.solutions.services.trinity.agenda.entities.Agenda;
import it.solutions.services.trinity.agenda.helpers.AgendaHelper;
import it.solutions.services.trinity.contracts.dto.AgendaDto;
import it.solutions.services.trinity.contracts.port.AgendaLookupPort;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgendaAdapter implements AgendaLookupPort {

    private final AgendaDao dao;
    private final AgendaHelper helper;



    @Transactional(readOnly = true)
    @Override
    public AgendaDto.Response findById(UUID medecinId) {

        Agenda employe = dao.findById(medecinId)
                .orElseThrow(()->new EntityNotFoundException("Rendez-vous introuvable"));

        return helper.toResponse(employe);
    }

}