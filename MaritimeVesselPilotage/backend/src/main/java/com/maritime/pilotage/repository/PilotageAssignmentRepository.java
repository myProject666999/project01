package com.maritime.pilotage.repository;

import com.maritime.pilotage.entity.PilotageAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PilotageAssignmentRepository extends JpaRepository<PilotageAssignment, Long> {

    Optional<PilotageAssignment> findByAssignmentNo(String assignmentNo);

    List<PilotageAssignment> findByOrderId(Long orderId);

    List<PilotageAssignment> findByPilotId(Long pilotId);

    List<PilotageAssignment> findByStatus(Integer status);

    List<PilotageAssignment> findByPilotIdAndStatus(Long pilotId, Integer status);

    List<PilotageAssignment> findByPlannedPilotageTimeBetween(LocalDateTime start, LocalDateTime end);

    List<PilotageAssignment> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT pa FROM PilotageAssignment pa WHERE pa.status = :status AND pa.plannedPilotageTime BETWEEN :startTime AND :endTime ORDER BY pa.plannedPilotageTime ASC")
    List<PilotageAssignment> findAssignmentsInTimeRangeWithStatus(
            @Param("status") Integer status,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("SELECT pa FROM PilotageAssignment pa WHERE pa.pilotId = :pilotId AND pa.plannedPilotageTime >= :startDate AND pa.plannedPilotageTime <= :endDate")
    List<PilotageAssignment> findPilotAssignmentsInDateRange(
            @Param("pilotId") Long pilotId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT pa FROM PilotageAssignment pa WHERE pa.tideWindowStart <= :dateTime AND pa.tideWindowEnd >= :dateTime")
    List<PilotageAssignment> findAssignmentsWithinTideWindow(@Param("dateTime") LocalDateTime dateTime);

    @Query("SELECT pa FROM PilotageAssignment pa WHERE pa.createdAt >= :startDate AND pa.createdAt <= :endDate")
    List<PilotageAssignment> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(pa) FROM PilotageAssignment pa WHERE pa.status = :status")
    Long countByStatus(@Param("status") Integer status);

    @Query("SELECT COUNT(pa) FROM PilotageAssignment pa WHERE pa.pilotId = :pilotId AND pa.status IN :statuses")
    Long countByPilotIdAndStatusIn(@Param("pilotId") Long pilotId, @Param("statuses") List<Integer> statuses);

    boolean existsByAssignmentNo(String assignmentNo);
}
