package com.chellavignesh.authserver.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "oauth2_rsa_keys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RsaKeyPairEntity {

    @Id
    private String id;

    @Column(name = "algorithm", nullable = false)
    private String algorithm = "RSA";

    @Column(name = "key_size", nullable = false)
    private Integer keySize;

    @Column(name = "purpose", nullable = false)
    private String purpose = "access_token_signing";

    @Column(name = "created", nullable = false)
    private Instant created;

    @Column(name = "active", nullable = false)
    private Boolean active = false;

    // Change ALL binary fields to Strings (Base64 encoded)
    @Column(name = "public_key", nullable = false, columnDefinition = "TEXT")
    private String publicKey;

    @Column(name = "private_key_encrypted", nullable = false, columnDefinition = "TEXT")
    private String privateKeyEncrypted;

    @Column(name = "retired_at")
    private Instant retiredAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy = "system";

    @Column(name = "rotated_by")
    private String rotatedBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "iv", nullable = false, columnDefinition = "TEXT")
    private String iv;

    @Column(name = "key_version", nullable = false)
    private Integer keyVersion = 1;

    public RsaKeyPairEntity(String id, Integer keySize, String purpose, Instant created,
                            Boolean active, String publicKey, String privateKeyEncrypted,
                            Instant expiresAt, String createdBy, String iv, Integer keyVersion) {
        this.id = id;
        this.keySize = keySize;
        this.purpose = purpose;
        this.created = created;
        this.active = active;
        this.publicKey = publicKey;
        this.privateKeyEncrypted = privateKeyEncrypted;
        this.expiresAt = expiresAt;
        this.createdBy = createdBy;
        this.iv = iv;
        this.keyVersion = keyVersion;
    }

}
