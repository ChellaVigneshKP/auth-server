package com.chellavignesh.authserver.components;

import com.chellavignesh.authserver.service.KeyManagementService;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class KeyHealthIndicator implements HealthIndicator {
    private final KeyManagementService keyManagementService;

    public KeyHealthIndicator(KeyManagementService keyManagementService) {
        this.keyManagementService = keyManagementService;
    }

    @Override
    public Health health() {
        var keys = keyManagementService.getActiveKeys();
        if (keys.isEmpty()) {
            return Health.down().withDetail("error", "No active keys available").build();
        }
        return Health.up().withDetail("activeKeys", keys.size()).build();
    }
}
