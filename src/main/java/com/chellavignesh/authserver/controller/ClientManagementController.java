package com.chellavignesh.authserver.controller;

import lombok.Getter;
import lombok.Setter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.UUID;

@RestController
@RequestMapping("/admin/clients")
public class ClientManagementController {

    private final JdbcRegisteredClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;

    public ClientManagementController(JdbcRegisteredClientRepository clientRepository,
                                      PasswordEncoder passwordEncoder) {
        this.clientRepository = clientRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // For REST JSON submissions
    @PostMapping(value = "/create", consumes = "application/json")
    public String createClientJson(@RequestBody ClientRequest request) {
        saveClient(request);
        return "Client created with ID: " + request.getClientId();
    }

    // For form submissions (x-www-form-urlencoded)
    @PostMapping(value = "/create", consumes = "application/x-www-form-urlencoded")
    public String createClientForm(@ModelAttribute ClientRequest request, Model model) {
        saveClient(request);
        model.addAttribute("message", "Client created with ID: " + request.getClientId());
        return "admin/create-client";
    }

    // Common method to save client
    private void saveClient(ClientRequest request) {
        String clientId = request.getClientId();
        String encodedSecret = passwordEncoder.encode(request.getClientSecret());

        RegisteredClient client = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId(clientId)
                .clientSecret(encodedSecret)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .redirectUri(request.getRedirectUri())
                .scope("openid")
                .scope("profile")
                .scope("email")
                .clientSettings(ClientSettings.builder()
                        .requireAuthorizationConsent(request.isRequireConsent())
                        .build())
                .tokenSettings(TokenSettings.builder()
                        .reuseRefreshTokens(true)
                        .accessTokenTimeToLive(Duration.ofMinutes(5))
                        .refreshTokenTimeToLive(Duration.ofHours(1))
                        .build())
                .build();

        clientRepository.save(client);
    }

    @Setter
    @Getter
    public static class ClientRequest {
        private String clientId;
        private String clientSecret;
        private String redirectUri;
        private boolean requireConsent = true;
    }
}