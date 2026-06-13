package it.solutions.services.trinity.patient.validations;


import it.solutions.services.trinity.patient.dao.ConsultationDao;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConsultationValidator {

    private final ConsultationDao dao;



}
