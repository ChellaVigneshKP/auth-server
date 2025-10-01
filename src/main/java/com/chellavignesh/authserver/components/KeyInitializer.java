package com.chellavignesh.authserver.components;

import com.chellavignesh.authserver.exception.KeyInitializationException;
import com.chellavignesh.authserver.service.KeyManagementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class KeyInitializer implements ApplicationRunner {
    private static final Logger logger = LoggerFactory.getLogger(KeyInitializer.class);

    private final KeyManagementService keyManagementService;

    @Value("${app.key.purposes}")
    private List<String> keyPurposes;

    public KeyInitializer(KeyManagementService keyManagementService) {
        this.keyManagementService = keyManagementService;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            initializeKeys();
        } catch (KeyInitializationException e) {
            throw e;
        } catch (Exception e) {
            throw new KeyInitializationException("Unexpected key initialization failure", e);
        }
    }

    private void initializeKeys() throws KeyInitializationException {
        if (keyPurposes == null || keyPurposes.isEmpty()) {
            logger.warn("No key purposes configured. Using default purposes.");
            keyPurposes = List.of("access_token_signing", "id_token_signing");
        }

        logger.info("Starting key initialization for purposes: {}", keyPurposes);

        for (String purpose : keyPurposes) {
            initializeKeyForPurpose(purpose);
        }

        logger.info("Key initialization completed successfully for all purposes");
    }

    private void initializeKeyForPurpose(String purpose) {
        try {
            var activeKeys = keyManagementService.getActiveKeysByPurpose(purpose);

            if (activeKeys.isEmpty()) {
                logger.info("No active keys found for {}. Generating initial key pair...", purpose);
                keyManagementService.generateKeyPair(purpose, "system_init");
                logger.info("Initial key pair generated for {}", purpose);
            } else {
                logger.info("Found {} active key pairs for {}", activeKeys.size(), purpose);
            }

        } catch (Exception e) {
            throw new KeyInitializationException(
                    String.format("Failed to initialize key for purpose '%s'", purpose), e);
        }
    }
}