package it.solutions.services.trinity.core;

import org.jasypt.encryption.StringEncryptor;
import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.iv.RandomIvGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;

@PropertySource("classpath:/core-config.properties")
@Configuration
@EnableCaching
@ComponentScan(basePackages = "it.solutions.services")
public class CoreConfig {

    @Value("${cache.lifetime:90}")
    private long cacheLifetime;

    @Value("${cache.capacity.max:200}")
    private long cacheCapacityMax;

    @Value("${jasypt.algorithm:PBEWithHmacSHA512AndAES_256}")
    private String algorithm ;

    @Value("${jasypt.pool-size:4}")
    private int poolSize;
    @Bean
    public MessageSource coreMngMessageSource() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:/core-messages");
        messageSource.setDefaultEncoding("UTF-8");
        return messageSource;
    }


    @Bean(name = "jasyptEncryptor")
    public StringEncryptor jasyptEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        encryptor.setIvGenerator(new RandomIvGenerator());
        encryptor.setPassword(getSecret());
        encryptor.setAlgorithm(algorithm);
        encryptor.setPoolSize(poolSize);
        return encryptor;
    }
    public static String getSecret() {
        return System.getProperty("jasypt.encryptor.password");
    }

}
