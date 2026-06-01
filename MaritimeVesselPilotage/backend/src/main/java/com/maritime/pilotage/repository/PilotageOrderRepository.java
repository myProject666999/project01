package com.maritime.pilotage.repository;

import com.maritime.pilotage.entity.PilotageOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PilotageOrderRepository extends JpaRepository<PilotageOrder, Long> {

    Optional<PilotageOrder> findByOrderNo(String orderNo);

    List<PilotageOrder> findByVesselId(Long vesselId);

    List<PilotageOrder> findByStatus(Integer status);

    List<PilotageOrder> findByPilotageType(Integer pilotageType);

    List<PilotageOrder> findByVesselIdAndStatus(Long vesselId, Integer status);

    List<PilotageOrder> findByEtaBetween(LocalDateTime start, LocalDateTime end);

    List<PilotageOrder> findBySubmitTimeBetween(LocalDateTime start, LocalDateTime end);

    List<PilotageOrder> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT po FROM PilotageOrder po WHERE po.status = :status AND po.eta BETWEEN :startTime AND :endTime ORDER BY po.eta ASC")
    List<PilotageOrder> findOrdersByStatusAndEtaRange(
            @Param("status") Integer status,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("SELECT po FROM PilotageOrder po WHERE po.companyName LIKE %:companyName%")
    List<PilotageOrder> findByCompanyNameContaining(@Param("companyName") String companyName);

    @Query("SELECT po FROM PilotageOrder po WHERE po.submitTime >= :startDate AND po.submitTime <= :endDate")
    List<PilotageOrder> findBySubmitDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT po FROM PilotageOrder po WHERE po.createdAt >= :startDate AND po.createdAt <= :endDate")
    List<PilotageOrder> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(po) FROM PilotageOrder po WHERE po.status = :status")
    Long countByStatus(@Param("status") Integer status);

    @Query("SELECT COUNT(po) FROM PilotageOrder po WHERE po.pilotageType = :pilotageType AND po.createdAt BETWEEN :startDate AND :endDate")
    Long countByPilotageTypeAndDateRange(
            @Param("pilotageType") Integer pilotageType,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    boolean existsByOrderNo(String orderNo);
}
