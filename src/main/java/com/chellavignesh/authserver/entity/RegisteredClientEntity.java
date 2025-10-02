package com.chellavignesh.authserver.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "oauth2_registered_client")
@Getter
@Setter
public class RegisteredClientEntity {

    @Id
    private String id;

    @Column(name = "client_id", nullable = false)
    private String clientId;

    @Column(name = "client_name", nullable = false)
    private String clientName;

    @Column(name = "client_secret")
    private String clientSecret;

    @Column(name = "redirect_uris")
    private String redirectUris;

    @Column(name = "scopes", nullable = false)
    private String scopes; // space-separated

    @Column(name = "authorization_grant_types", nullable = false)
    private String authorizationGrantTypes;

    @Column(name = "client_authentication_methods", nullable = false)
    private String clientAuthenticationMethods;

    @Column(name = "client_id_issued_at")
    private Instant clientIdIssuedAt;

    @Column(name = "client_secret_expires_at")
    private Instant clientSecretExpiresAt;

    @Column(name = "client_settings")
    private String clientSettings;

    @Column(name = "token_settings")
    private String tokenSettings;

    @Column(name = "post_logout_redirect_uris")
    private String postLogoutRedirectUris;
}