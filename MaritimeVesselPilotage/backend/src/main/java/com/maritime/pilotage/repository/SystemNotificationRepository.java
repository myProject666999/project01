package com.maritime.pilotage.repository;

import com.maritime.pilotage.entity.SystemNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SystemNotificationRepository extends JpaRepository<SystemNotification, Long> {

    List<SystemNotification> findByRecipientTypeAndRecipientId(Integer recipientType, Long recipientId);

    List<SystemNotification> findByRecipientTypeAndRecipientIdAndIsRead(Integer recipientType, Long recipientId, Boolean isRead);

    List<SystemNotification> findByNotificationType(Integer notificationType);

    List<SystemNotification> findByIsRead(Boolean isRead);

    List<SystemNotification> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT sn FROM SystemNotification sn WHERE sn.recipientType = :recipientType AND sn.recipientId = :recipientId ORDER BY sn.createdAt DESC")
    List<SystemNotification> findByRecipientOrderByCreatedAtDesc(
            @Param("recipientType") Integer recipientType,
            @Param("recipientId") Long recipientId);

    @Query("SELECT sn FROM SystemNotification sn WHERE sn.recipientType = :recipientType AND sn.recipientId = :recipientId AND sn.createdAt BETWEEN :startDate AND :endDate")
    List<SystemNotification> findByRecipientAndDateRange(
            @Param("recipientType") Integer recipientType,
            @Param("recipientId") Long recipientId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT sn FROM SystemNotification sn WHERE sn.createdAt >= :startDate AND sn.createdAt <= :endDate")
    List<SystemNotification> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT sn FROM SystemNotification sn WHERE sn.relatedBusinessId = :relatedBusinessId AND sn.relatedBusinessType = :relatedBusinessType")
    List<SystemNotification> findByRelatedBusiness(
            @Param("relatedBusinessId") Long relatedBusinessId,
            @Param("relatedBusinessType") String relatedBusinessType);

    @Query("SELECT COUNT(sn) FROM SystemNotification sn WHERE sn.recipientType = :recipientType AND sn.recipientId = :recipientId AND sn.isRead = false")
    Long countUnreadByRecipient(@Param("recipientType") Integer recipientType, @Param("recipientId") Long recipientId);

    @Query("SELECT COUNT(sn) FROM SystemNotification sn WHERE sn.recipientType = :recipientType AND sn.recipientId = :recipientId")
    Long countByRecipient(@Param("recipientType") Integer recipientType, @Param("recipientId") Long recipientId);
}
