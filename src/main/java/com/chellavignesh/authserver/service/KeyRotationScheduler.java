package com.chellavignesh.authserver.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
public class KeyRotationScheduler {
    private static final Logger logger = LoggerFactory.getLogger(KeyRotationScheduler.class);

    private final KeyManagementService keyManagementService;

    @Value("${app.key.rotation-threshold-days:30}")
    private int rotationThresholdDays;

    @Value("${app.key.purposes}")
    private List<String> keyPurposes;

    public KeyRotationScheduler(KeyManagementService keyManagementService) {
        this.keyManagementService = keyManagementService;
    }

    @Scheduled(cron = "${app.key.rotation-cron:0 0 2 * * ?}")
    public void rotateKeysIfNeeded() {
        logger.info("Starting key rotation check...");

        try {

            for (String purpose : keyPurposes) {
                var activeKeys = keyManagementService.getActiveKeysByPurpose(purpose);

                if (activeKeys.isEmpty()) {
                    logger.info("No active keys found for {}. Generating new key pair.", purpose);
                    keyManagementService.generateKeyPair(purpose, "system_auto");
                    continue;
                }

                var primaryKey = activeKeys.getFirst();
                Instant rotationTime = primaryKey.getExpiresAt()
                        .minusSeconds(rotationThresholdDays * 24 * 60 * 60L);

                if (Instant.now().isAfter(rotationTime)) {
                    logger.info("Key for {} nearing expiry. Rotating...", purpose);
                    keyManagementService.generateKeyPair(purpose, "system_auto");

                    // Keep only the last 2 active keys for rollover
                    if (activeKeys.size() >= 2) {
                        for (int i = 1; i < activeKeys.size(); i++) {
                            keyManagementService.deactivateKey(activeKeys.get(i).getId(), "system_cleanup");
                        }
                    }
                }
            }

            // Clean up expired keys
            keyManagementService.cleanupExpiredKeys();

            logger.info("Key rotation check completed successfully.");

        } catch (Exception e) {
            logger.error("Key rotation failed", e);
        }
    }

    @Scheduled(cron = "0 0 3 * * SUN") // Weekly cleanup
    public void comprehensiveCleanup() {
        logger.info("Running comprehensive key cleanup...");
        keyManagementService.cleanupExpiredKeys();
    }
}