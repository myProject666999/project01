package com.maritime.pilotage.repository;

import com.maritime.pilotage.entity.Tug;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TugRepository extends JpaRepository<Tug, Long> {

    Optional<Tug> findByTugCode(String tugCode);

    List<Tug> findByStatus(Integer status);

    List<Tug> findByTugNameContaining(String tugName);

    List<Tug> findByHorsepowerGreaterThanEqual(Integer minHorsepower);

    List<Tug> findByBollardPullGreaterThanEqual(BigDecimal minBollardPull);

    List<Tug> findByStatusAndHorsepowerGreaterThanEqual(Integer status, Integer minHorsepower);

    List<Tug> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT t FROM Tug t WHERE t.status = :status ORDER BY t.horsepower DESC")
    List<Tug> findAvailableTugsOrderByHorsepower(@Param("status") Integer status);

    @Query("SELECT t FROM Tug t WHERE t.currentLocation LIKE %:location%")
    List<Tug> findByLocationContaining(@Param("location") String location);

    @Query("SELECT t FROM Tug t WHERE t.createdAt >= :startDate AND t.createdAt <= :endDate")
    List<Tug> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM Tug t WHERE t.status = :status AND t.horsepower >= :minHorsepower AND t.bollardPull >= :minBollardPull")
    List<Tug> findTugsByRequirements(
            @Param("status") Integer status,
            @Param("minHorsepower") Integer minHorsepower,
            @Param("minBollardPull") BigDecimal minBollardPull);

    @Query("SELECT COUNT(t) FROM Tug t WHERE t.status = :status")
    Long countByStatus(@Param("status") Integer status);

    @Query("SELECT AVG(t.horsepower) FROM Tug t WHERE t.status = 1")
    Double calculateAverageHorsepower();

    boolean existsByTugCode(String tugCode);
}
