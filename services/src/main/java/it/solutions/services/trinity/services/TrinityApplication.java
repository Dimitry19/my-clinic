package it.solutions.services.trinity.services;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {
        "it.solutions.services.trinity.core",
        "it.solutions.services.trinity.patient.controller",
        "it.solutions.services.trinity.agenda.controller",
        "it.solutions.services.trinity.employe.controller",
        "it.solutions.services.trinity.laboratoire.controller",
        "it.solutions.services.trinity.services.controllers.*",
})
@EnableJpaRepositories(basePackages = {
        "it.solutions.services.trinity.core.shared.dao",
        "it.solutions.services.trinity.patient.dao",
        "it.solutions.services.trinity.employe.dao",
        "it.solutions.services.trinity.agenda.dao",
        "it.solutions.services.trinity.laboratoire.dao",
},
        entityManagerFactoryRef = "entityManagerFactory" )
@EntityScan(basePackages = {
        "it.solutions.services.trinity.core.shared.entities",
        "it.solutions.services.trinity.patient.entities",
        "it.solutions.services.trinity.employe.entities",
        "it.solutions.services.trinity.agenda.entities",
        "it.solutions.services.trinity.contracts.entities",
        "it.solutions.services.trinity.laboratoire.entities"
})
public class  TrinityApplication {
    static {
        System.setProperty("spring.devtools.restart.enabled", "false");
    }
    public static void main(String[] args) {
        SpringApplication.run(TrinityApplication.class, args);
    }

}
