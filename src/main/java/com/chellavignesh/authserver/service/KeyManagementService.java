package com.chellavignesh.authserver.service;

import com.chellavignesh.authserver.entity.RsaKeyPairEntity;
import com.chellavignesh.authserver.repository.RsaKeyPairRepository;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class KeyManagementService {
    private static final Logger logger = LoggerFactory.getLogger(KeyManagementService.class);

    private final RsaKeyPairRepository keyRepository;
    private final AesGcmEncryptionService encryptionService;
    private final KeyManagementService self; // Inject self for transactional calls

    @Getter
    @Value("${app.key.validity-days:90}")
    private int keyValidityDays;

    @Value("${app.key.size:2048}")
    private int keySize;

    public KeyManagementService(RsaKeyPairRepository keyRepository,
                                AesGcmEncryptionService encryptionService,
                                @Lazy KeyManagementService self) { // Lazy to avoid circular injection
        this.keyRepository = keyRepository;
        this.encryptionService = encryptionService;
        this.self = self;
    }

    @Transactional
    public void generateKeyPair(String purpose, String createdBy) {
        try {
            logger.info("Generating new RSA key pair for purpose: {}", purpose);

            KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
            keyGen.initialize(keySize);
            KeyPair keyPair = keyGen.generateKeyPair();

            String keyId = UUID.randomUUID().toString();
            Instant now = Instant.now();
            Instant expiresAt = now.plusSeconds(keyValidityDays * 24 * 60 * 60L);

            String publicKeyBase64 = Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());
            String privateKeyBase64 = Base64.getEncoder().encodeToString(keyPair.getPrivate().getEncoded());

            var encryptionResult = encryptionService.encrypt(privateKeyBase64.getBytes());
            String encryptedPrivateKeyBase64 = Base64.getEncoder().encodeToString(encryptionResult.encryptedData());
            String ivBase64 = Base64.getEncoder().encodeToString(encryptionResult.iv());

            // Call transactional method via proxy
            self.deactivateCurrentKey(purpose, "rotated_by_system");

            RsaKeyPairEntity keyEntity = new RsaKeyPairEntity(
                    keyId, keySize, purpose, now, true,
                    publicKeyBase64, encryptedPrivateKeyBase64,
                    expiresAt, createdBy, ivBase64, 1
            );

            keyRepository.save(keyEntity);
            logger.info("Generated new key pair with ID: {}", keyId);

        } catch (Exception e) {
            logger.error("Failed to generate key pair for purpose: {}", purpose, e);
            throw new RuntimeException("Key generation failed", e);
        }
    }

    public KeyPair getKeyPair(String keyId) {
        RsaKeyPairEntity keyEntity = keyRepository.findById(keyId)
                .orElseThrow(() -> new RuntimeException("Key not found: " + keyId));
        return reconstructKeyPair(keyEntity);
    }

    public KeyPair getActiveKeyPair(String purpose) {
        RsaKeyPairEntity keyEntity = keyRepository.findByPurposeAndActiveTrue(purpose)
                .orElseThrow(() -> new RuntimeException("No active key found for purpose: " + purpose));
        return reconstructKeyPair(keyEntity);
    }

    public List<RsaKeyPairEntity> getActiveKeys() {
        return keyRepository.findByActiveTrueOrderByCreatedDesc();
    }

    public List<RsaKeyPairEntity> getActiveKeysByPurpose(String purpose) {
        return keyRepository.findByPurposeAndActiveTrueOrderByCreatedDesc(purpose);
    }

    @Transactional
    public void deactivateKey(String keyId, String deactivatedBy) {
        keyRepository.findById(keyId).ifPresent(key -> {
            key.setActive(false);
            key.setRetiredAt(Instant.now());
            key.setRotatedBy(deactivatedBy);
            keyRepository.save(key);
            logger.info("Deactivated key: {}", keyId);
        });
    }

    @Transactional
    public void deactivateCurrentKey(String purpose, String deactivatedBy) {
        keyRepository.findByPurposeAndActiveTrue(purpose).ifPresent(key -> {
            key.setActive(false);
            key.setRetiredAt(Instant.now());
            key.setRotatedBy(deactivatedBy);
            keyRepository.save(key);
            logger.info("Deactivated current key for purpose: {}", purpose);
        });
    }

    @Transactional
    public void cleanupExpiredKeys() {
        Instant now = Instant.now();
        List<RsaKeyPairEntity> expiredKeys = keyRepository.findExpiredActiveKeys(now);

        for (RsaKeyPairEntity key : expiredKeys) {
            key.setActive(false);
            key.setRetiredAt(now);
            key.setRotatedBy("system_cleanup");
            keyRepository.save(key);
            logger.info("Cleaned up expired key: {}", key.getId());
        }
    }

    private KeyPair reconstructKeyPair(RsaKeyPairEntity keyEntity) {
        try {
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");

            byte[] publicKeyBytes = Base64.getDecoder().decode(keyEntity.getPublicKey());
            X509EncodedKeySpec publicKeySpec = new X509EncodedKeySpec(publicKeyBytes);
            PublicKey publicKey = keyFactory.generatePublic(publicKeySpec);

            byte[] encryptedPrivateKeyBytes = Base64.getDecoder().decode(keyEntity.getPrivateKeyEncrypted());
            byte[] ivBytes = Base64.getDecoder().decode(keyEntity.getIv());

            byte[] decryptedPrivateKeyBase64 = encryptionService.decrypt(encryptedPrivateKeyBytes, ivBytes);
            String privateKeyBase64 = new String(decryptedPrivateKeyBase64);

            byte[] privateKeyBytes = Base64.getDecoder().decode(privateKeyBase64);
            PKCS8EncodedKeySpec privateKeySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
            PrivateKey privateKey = keyFactory.generatePrivate(privateKeySpec);

            return new KeyPair(publicKey, privateKey);

        } catch (Exception e) {
            throw new RuntimeException("Failed to reconstruct key pair for: " + keyEntity.getId(), e);
        }
    }
}