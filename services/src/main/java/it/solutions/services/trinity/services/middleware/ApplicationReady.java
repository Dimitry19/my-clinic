package it.solutions.services.trinity.services.middleware;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

/**
 * Hock to know when the application is ready.
 * The application is fully initialized and ready to serve requests
 */
@Component
public class ApplicationReady implements ApplicationListener<ApplicationReadyEvent> {

    protected final Logger logger = LoggerFactory.getLogger(ApplicationReady.class);

    @Value("${spring.application.name}")
    protected String applicationName;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        logger.info("Application [{}] entièrement initialisée","\u001B[31m"+applicationName+"\u001B[0m");
        // Application is ready.
        // We can add code to do something when application is ready, if needed.
    }
}