package com.chellavignesh.authserver.repository;

import com.chellavignesh.authserver.entity.RsaKeyPairEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface RsaKeyPairRepository extends JpaRepository<RsaKeyPairEntity, String> {

    List<RsaKeyPairEntity> findByActiveTrueOrderByCreatedDesc();

    List<RsaKeyPairEntity> findByPurposeAndActiveTrueOrderByCreatedDesc(String purpose);

    Optional<RsaKeyPairEntity> findByPurposeAndActiveTrue(String purpose);

    List<RsaKeyPairEntity> findByExpiresAtBeforeAndActiveTrue(Instant expiresAt);

    @Query("SELECT k FROM RsaKeyPairEntity k WHERE k.active = true AND k.expiresAt < :currentTime")
    List<RsaKeyPairEntity> findExpiredActiveKeys(@Param("currentTime") Instant currentTime);

    @Query("SELECT k FROM RsaKeyPairEntity k WHERE k.active = true AND k.purpose = :purpose ORDER BY k.created DESC")
    List<RsaKeyPairEntity> findActiveKeysByPurpose(@Param("purpose") String purpose);
}