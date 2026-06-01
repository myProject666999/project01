package com.maritime.pilotage.repository;

import com.maritime.pilotage.entity.PilotageBilling;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PilotageBillingRepository extends JpaRepository<PilotageBilling, Long> {

    Optional<PilotageBilling> findByBillingNo(String billingNo);

    List<PilotageBilling> findByOrderId(Long orderId);

    List<PilotageBilling> findByVesselId(Long vesselId);

    List<PilotageBilling> findByBillingStatus(Integer billingStatus);

    List<PilotageBilling> findByBillingDateBetween(LocalDate startDate, LocalDate endDate);

    List<PilotageBilling> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT pb FROM PilotageBilling pb WHERE pb.billingStatus = :billingStatus AND pb.billingDate BETWEEN :startDate AND :endDate")
    List<PilotageBilling> findBillingsByStatusAndDateRange(
            @Param("billingStatus") Integer billingStatus,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT pb FROM PilotageBilling pb WHERE pb.vesselId = :vesselId AND pb.createdAt >= :startDate AND pb.createdAt <= :endDate")
    List<PilotageBilling> findVesselBillingsInDateRange(
            @Param("vesselId") Long vesselId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT pb FROM PilotageBilling pb WHERE pb.createdAt >= :startDate AND pb.createdAt <= :endDate")
    List<PilotageBilling> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(pb.totalAmount), 0) FROM PilotageBilling pb WHERE pb.billingStatus = :billingStatus AND pb.billingDate BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalAmountByStatusAndDateRange(
            @Param("billingStatus") Integer billingStatus,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(pb) FROM PilotageBilling pb WHERE pb.billingStatus = :billingStatus")
    Long countByBillingStatus(@Param("billingStatus") Integer billingStatus);

    boolean existsByBillingNo(String billingNo);
}
