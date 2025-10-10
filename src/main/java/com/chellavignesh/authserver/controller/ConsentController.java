package com.chellavignesh.authserver.controller;

import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsent;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@Controller
public class ConsentController {

    private final JdbcRegisteredClientRepository clientRepository;
    private final OAuth2AuthorizationConsentService authorizationConsentService;

    public ConsentController(JdbcRegisteredClientRepository clientRepository,
                             OAuth2AuthorizationConsentService authorizationConsentService) {
        this.clientRepository = clientRepository;
        this.authorizationConsentService = authorizationConsentService;
    }

    @GetMapping("/oauth2/consent")
    public String consent(Principal principal, Model model,
                          @RequestParam(OAuth2ParameterNames.CLIENT_ID) String clientId,
                          @RequestParam(OAuth2ParameterNames.STATE) String state,
                          @RequestParam(name = OAuth2ParameterNames.SCOPE, required = false) String scope,
                          @RequestParam(name = OAuth2ParameterNames.REDIRECT_URI, required = false) String redirectUri) {

        // Remove these parameters from the session to ensure clean state
        removeAuthorizationRequestSessionAttributes();

        // Fetch the client
        RegisteredClient registeredClient = this.clientRepository.findByClientId(clientId);
        if (registeredClient == null) {
            throw new IllegalArgumentException("Invalid client_id: " + clientId);
        }

        // Get principal name
        String principalName = principal != null ? principal.getName() : "Unknown";

        // Get previously approved scopes
        Set<String> previouslyApprovedScopes = getPreviouslyApprovedScopes(principalName, clientId);

        // Get requested scopes
        Set<String> requestedScopes = StringUtils.hasText(scope) ?
                Arrays.stream(scope.split(" ")).collect(Collectors.toSet()) :
                Collections.emptySet();

        // Separate currently requested scopes from previously approved ones
        Set<String> scopesToApprove = new HashSet<>(requestedScopes);
        scopesToApprove.removeAll(previouslyApprovedScopes);

        // Prepare model attributes
        model.addAttribute("clientId", clientId);
        model.addAttribute("state", state);
        model.addAttribute("redirectUri", redirectUri);
        model.addAttribute("principalName", principalName);
        model.addAttribute("scopes", withDescription(scopesToApprove));
        model.addAttribute("previouslyApprovedScopes", withDescription(previouslyApprovedScopes));

        return "oauth2/consent";
    }

    private Set<ScopeWithDescription> withDescription(Set<String> scopes) {
        return scopes.stream()
                .map(scope -> new ScopeWithDescription(scope, getScopeDescription(scope)))
                .collect(Collectors.toSet());
    }

    private String getScopeDescription(String scope) {
        Map<String, String> scopeDescriptions = new HashMap<>();
        scopeDescriptions.put("openid", "Access your basic profile information");
        scopeDescriptions.put("profile", "Access your profile details (name, picture, etc.)");
        scopeDescriptions.put("email", "Access your email address");
        scopeDescriptions.put("address", "Access your address information");
        scopeDescriptions.put("phone", "Access your phone number");
        scopeDescriptions.put("offline_access", "Access your data while you are offline");

        return scopeDescriptions.getOrDefault(scope, "Access: " + scope);
    }

    private Set<String> getPreviouslyApprovedScopes(String principalName, String clientId) {
        OAuth2AuthorizationConsent previousConsent =
                this.authorizationConsentService.findById(clientId, principalName);
        return previousConsent != null ? previousConsent.getScopes() : Collections.emptySet();
    }

    private void removeAuthorizationRequestSessionAttributes() {
        // Clean up any existing authorization request attributes
        // This prevents issues with stale data
    }

    public record ScopeWithDescription(String scope, String description) {

    }
}