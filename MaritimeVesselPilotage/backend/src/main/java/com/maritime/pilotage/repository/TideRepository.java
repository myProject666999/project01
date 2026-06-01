package com.maritime.pilotage.repository;

import com.maritime.pilotage.entity.Tide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TideRepository extends JpaRepository<Tide, Long> {

    List<Tide> findByTideDate(LocalDate tideDate);

    List<Tide> findByTideDateBetween(LocalDate startDate, LocalDate endDate);

    List<Tide> findByPort(String port);

    List<Tide> findByTideType(Integer tideType);

    List<Tide> findByPortAndTideDateBetween(String port, LocalDate startDate, LocalDate endDate);

    Optional<Tide> findByTideDateAndTideTimeAndPort(LocalDate tideDate, java.time.LocalTime tideTime, String port);

    @Query("SELECT t FROM Tide t WHERE t.tideDate >= :startDate AND t.tideDate <= :endDate ORDER BY t.tideDate ASC, t.tideTime ASC")
    List<Tide> findByDateRangeOrderByDateTime(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Tide t WHERE t.port = :port AND t.tideDate = :date ORDER BY t.tideTime ASC")
    List<Tide> findByPortAndDateOrderByTime(@Param("port") String port, @Param("date") LocalDate date);

    @Query("SELECT t FROM Tide t WHERE t.createdAt >= :startDate AND t.createdAt <= :endDate")
    List<Tide> findByCreatedAtRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM Tide t WHERE t.port = :port AND t.tideDate BETWEEN :startDate AND :endDate AND t.tideType = :tideType")
    List<Tide> findByPortDateRangeAndType(
            @Param("port") String port,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("tideType") Integer tideType);

    @Query("SELECT MAX(t.tideHeight) FROM Tide t WHERE t.port = :port AND t.tideDate BETWEEN :startDate AND :endDate")
    java.math.BigDecimal findMaxTideHeightInRange(@Param("port") String port, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT MIN(t.tideHeight) FROM Tide t WHERE t.port = :port AND t.tideDate BETWEEN :startDate AND :endDate")
    java.math.BigDecimal findMinTideHeightInRange(@Param("port") String port, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(t) FROM Tide t WHERE t.tideDate BETWEEN :startDate AND :endDate")
    Long countByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
