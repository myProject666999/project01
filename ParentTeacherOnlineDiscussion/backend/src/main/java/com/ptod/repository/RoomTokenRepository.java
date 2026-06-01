package com.ptod.repository;

import com.ptod.entity.RoomToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomTokenRepository extends JpaRepository<RoomToken, Long> {

    Optional<RoomToken> findByToken(String token);

    List<RoomToken> findByAppointmentId(Long appointmentId);

    List<RoomToken> findByAppointmentIdAndUserId(Long appointmentId, Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM RoomToken r WHERE r.token = :token AND r.used = false AND r.expiresAt > :now")
    Optional<RoomToken> findValidTokenAndLock(@Param("token") String token, @Param("now") LocalDateTime now);

    boolean existsByAppointmentIdAndUserIdAndUsedFalse(Long appointmentId, Long userId);
}
