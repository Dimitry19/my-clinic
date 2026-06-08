package it.solutions.services.trinity.core.security;

import ch.qos.logback.classic.Logger;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.time.DateUtils;
import org.slf4j.LoggerFactory;

import java.util.Base64;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.Random;

public class PasswordUtils {

    private static final  Logger logger = (Logger) LoggerFactory.getLogger(PasswordUtils.class);
    private PasswordUtils(){
        logger.info("Utility class");
    }


    private static  final String ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final Random rnd = new Random(System.currentTimeMillis());
    private static  final int LENGHT = 6;


    public static String generatePasswordPlainText(){
        StringBuilder sb = new StringBuilder(LENGHT);
        for (int i = 0; i < LENGHT; i++) {
            sb.append(ALPHABET.charAt(rnd.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }

    public static String generatePasswordEmploye(String nom, String prenom){
        String random = "";
        String part=   "";
        if(StringUtils.isNotEmpty(nom) && StringUtils.isNotEmpty(prenom)){
              random = nom.substring(0,2);
              part=   prenom.substring(0,2);
        }
        String  year =String.valueOf(gregorianCalendar(Calendar.YEAR)).substring(2);

        return concatenate("!",part,random,"@", year);

    }


    public static int gregorianCalendar(int elementType) {
        return new GregorianCalendar().get(elementType);
    }
    public static String concatenate( String... str) {
        StringBuilder sb = new StringBuilder();
        for ( String s : str) {
            sb.append(s);
        }
        return sb.toString();
    }
}
