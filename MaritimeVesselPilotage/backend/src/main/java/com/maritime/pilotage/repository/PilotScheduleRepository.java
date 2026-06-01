package com.maritime.pilotage.repository;

import com.maritime.pilotage.entity.PilotSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PilotScheduleRepository extends JpaRepository<PilotSchedule, Long> {

    List<PilotSchedule> findByPilotId(Long pilotId);

    List<PilotSchedule> findByScheduleDate(LocalDate scheduleDate);

    List<PilotSchedule> findByScheduleDateBetween(LocalDate startDate, LocalDate endDate);

    List<PilotSchedule> findByPilotIdAndScheduleDateBetween(Long pilotId, LocalDate startDate, LocalDate endDate);

    List<PilotSchedule> findByStatus(Integer status);

    List<PilotSchedule> findByShiftType(Integer shiftType);

    List<PilotSchedule> findByIsOnCall(Boolean isOnCall);

    Optional<PilotSchedule> findByPilotIdAndScheduleDateAndShiftType(Long pilotId, LocalDate scheduleDate, Integer shiftType);

    @Query("SELECT ps FROM PilotSchedule ps WHERE ps.scheduleDate >= :startDate AND ps.scheduleDate <= :endDate")
    List<PilotSchedule> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT ps FROM PilotSchedule ps WHERE ps.pilotId = :pilotId AND ps.scheduleDate >= :startDate AND ps.scheduleDate <= :endDate AND ps.status = :status")
    List<PilotSchedule> findPilotSchedulesInRangeWithStatus(
            @Param("pilotId") Long pilotId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") Integer status);

    @Query("SELECT ps FROM PilotSchedule ps WHERE ps.startTime <= :dateTime AND ps.endTime >= :dateTime AND ps.status = 1")
    List<PilotSchedule> findActiveSchedulesAtDateTime(@Param("dateTime") LocalDateTime dateTime);

    @Query("SELECT COUNT(ps) FROM PilotSchedule ps WHERE ps.pilotId = :pilotId AND ps.scheduleDate BETWEEN :startDate AND :endDate")
    Long countByPilotIdAndDateRange(@Param("pilotId") Long pilotId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
