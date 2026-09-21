package it.solutions.services.trinity.core;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {
        "it.solutions.services.trinity.core.shared.dao", // <-- Package racine de vos DAO
})
public class CoreTestApplication {
    // Cette classe reste vide. Elle sert uniquement de point d'entrée
    // pour que Spring Boot puisse bâtir le contexte de test.
}