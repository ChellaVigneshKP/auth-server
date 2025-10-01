CREATE TABLE IF NOT EXISTS oauth2_rsa_keys
(
    id                    VARCHAR(100) PRIMARY KEY,
    algorithm             VARCHAR(50)              NOT NULL DEFAULT 'RSA',
    key_size              INTEGER                  NOT NULL,
    purpose               VARCHAR(50)              NOT NULL DEFAULT 'access_token_signing',
    created               TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active                BOOLEAN                  NOT NULL DEFAULT FALSE,
    public_key            BYTEA                    NOT NULL,
    private_key_encrypted BYTEA                    NOT NULL,
    retired_at            TIMESTAMP WITH TIME ZONE NULL,
    expires_at            TIMESTAMP WITH TIME ZONE NULL,
    created_by            VARCHAR(100)             NOT NULL DEFAULT 'system',
    rotated_by            VARCHAR(100)             NULL,
    notes                 TEXT                     NULL,
    encryption_algorithm  VARCHAR(50)              NOT NULL DEFAULT 'AES/GCM/NoPadding',
    iv                    BYTEA                    NOT NULL,
    key_version           INTEGER                  NOT NULL DEFAULT 1,
    CONSTRAINT chk_key_size CHECK (key_size >= 2048),
    CONSTRAINT chk_purpose CHECK (purpose IN ('access_token_signing', 'id_token_signing'))
);

CREATE INDEX IF NOT EXISTS idx_oauth2_rsa_keys_created ON oauth2_rsa_keys (created DESC);
CREATE INDEX IF NOT EXISTS idx_oauth2_rsa_keys_active ON oauth2_rsa_keys (active);
CREATE INDEX IF NOT EXISTS idx_oauth2_rsa_keys_purpose ON oauth2_rsa_keys (purpose);
CREATE INDEX IF NOT EXISTS idx_oauth2_rsa_keys_expires ON oauth2_rsa_keys (expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth2_rsa_keys_active_purpose
    ON oauth2_rsa_keys (purpose, active) WHERE active = true;