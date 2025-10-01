package com.chellavignesh.authserver.components;

import com.chellavignesh.authserver.entity.RsaKeyPairEntity;
import com.chellavignesh.authserver.repository.RsaKeyPairRepository;
import com.chellavignesh.authserver.service.KeyManagementService;
import com.nimbusds.jose.KeySourceException;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSelector;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.stereotype.Component;

import java.security.KeyPair;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class RsaKeyPairRepositoryJWKSource
        implements JWKSource<SecurityContext>, OAuth2TokenCustomizer<JwtEncodingContext> {

    private final RsaKeyPairRepository keyRepository;
    private final KeyManagementService keyManagementService;

    public RsaKeyPairRepositoryJWKSource(
            RsaKeyPairRepository keyRepository,
            KeyManagementService keyManagementService) {
        this.keyRepository = keyRepository;
        this.keyManagementService = keyManagementService;
    }

    @Override
    public List<JWK> get(JWKSelector jwkSelector, SecurityContext context) throws KeySourceException {
        List<RsaKeyPairEntity> entities = keyRepository.findByActiveTrueOrderByCreatedDesc();
        List<JWK> result = new ArrayList<>(entities.size());

        for (RsaKeyPairEntity entity : entities) {
            KeyPair kp = keyManagementService.getKeyPair(entity.getId());

            RSAKey rsaKey = new RSAKey.Builder((RSAPublicKey) kp.getPublic())
                    .privateKey((RSAPrivateKey) kp.getPrivate())
                    .keyID(entity.getId())
                    .build();

            if (jwkSelector.getMatcher().matches(rsaKey)) {
                result.add(rsaKey);
            }
        }
        return result;
    }

    @Override
    public void customize(JwtEncodingContext context) {
        keyRepository.findByActiveTrueOrderByCreatedDesc().stream()
                .max(Comparator.comparing(RsaKeyPairEntity::getCreated))
                .ifPresent(latestKey ->
                        context.getJwsHeader().keyId(latestKey.getId()));
    }
}