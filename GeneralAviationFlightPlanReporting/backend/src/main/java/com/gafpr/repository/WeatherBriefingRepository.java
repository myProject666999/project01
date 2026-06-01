package com.gafpr.repository;

import com.gafpr.entity.WeatherBriefing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeatherBriefingRepository extends JpaRepository<WeatherBriefing, Long> {

    List<WeatherBriefing> findByFlightPlanIdOrderByBriefingTimeDesc(Long flightPlanId);

    @Query("SELECT w FROM WeatherBriefing w WHERE w.flightPlanId = :flightPlanId " +
           "AND w.validFrom <= :time AND w.validTo >= :time " +
           "ORDER BY w.briefingTime DESC")
    Optional<WeatherBriefing> findLatestValidBriefing(Long flightPlanId, LocalDateTime time);
}
