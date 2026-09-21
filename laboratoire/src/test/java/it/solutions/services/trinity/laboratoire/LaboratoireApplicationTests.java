package it.solutions.services.trinity.laboratoire;

import it.solutions.services.trinity.contracts.port.EmployeLookupPort;
import it.solutions.services.trinity.contracts.port.PatientLookupPort;
import it.solutions.services.trinity.core.security.services.UserService;
import it.solutions.services.trinity.laboratoire.dao.ExamenLaboDao;
import it.solutions.services.trinity.laboratoire.dao.ResultatExamenLaboDao;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class LaboratoireApplicationTests {

    @MockitoBean
    private ExamenLaboDao examenLaboDao;

    @MockitoBean
    private ResultatExamenLaboDao resultatExamenLaboDao;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private  EmployeLookupPort employeLookupPort;

    @MockitoBean
    private  PatientLookupPort patientLookupPort;

    @Test
    void contextLoads() {
    }

}
