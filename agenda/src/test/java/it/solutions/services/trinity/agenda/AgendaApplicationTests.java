package it.solutions.services.trinity.agenda;

import it.solutions.services.trinity.agenda.dao.AgendaDao;
import it.solutions.services.trinity.contracts.port.EmployeLookupPort;
import it.solutions.services.trinity.contracts.port.PatientLookupPort;
import it.solutions.services.trinity.core.security.services.JwtService;
import it.solutions.services.trinity.core.shared.dao.UserDao;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class AgendaApplicationTests {


    @MockitoBean // Crée automatiquement un mock et l'ajoute au contexte de test Spring
    private AgendaDao agendaDao;

    @MockitoBean
    private UserDao userDao;

    @MockitoBean
    private PatientLookupPort patientLookupPort;

    @MockitoBean
    private EmployeLookupPort employeLookupPort;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void contextLoads() {
    }

}
