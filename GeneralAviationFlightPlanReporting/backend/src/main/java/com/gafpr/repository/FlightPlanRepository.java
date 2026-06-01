package com.gafpr.repository;

import com.gafpr.entity.FlightPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightPlanRepository extends JpaRepository<FlightPlan, Long> {

    Optional<FlightPlan> findByPlanNumber(String planNumber);

    List<FlightPlan> findByPilotIdOrderByCreatedAtDesc(Long pilotId);

    List<FlightPlan> findByStatusOrderByCreatedAtDesc(String status);

    @Query("SELECT f FROM FlightPlan f WHERE f.airspaceIds LIKE %:airspaceId% " +
           "AND f.status IN ('SUBMITTED', 'APPROVING', 'APPROVED') " +
           "AND ((f.departureTime BETWEEN :startTime AND :endTime) " +
           "OR (f.arrivalTime BETWEEN :startTime AND :endTime))")
    List<FlightPlan> findConflictingPlans(String airspaceId, LocalDateTime startTime, LocalDateTime endTime);

    List<FlightPlan> findByDepartureTimeBetweenOrderByDepartureTimeAsc(LocalDateTime start, LocalDateTime end);
}
