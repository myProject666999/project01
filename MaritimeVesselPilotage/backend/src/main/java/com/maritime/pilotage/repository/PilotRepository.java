package com.maritime.pilotage.repository;

import com.maritime.pilotage.entity.Pilot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PilotRepository extends JpaRepository<Pilot, Long> {

    Optional<Pilot> findByEmployeeNo(String employeeNo);

    List<Pilot> findByStatus(Integer status);

    List<Pilot> findByPilotLevel(Integer pilotLevel);

    List<Pilot> findByNameContaining(String name);

    List<Pilot> findByStatusAndPilotLevel(Integer status, Integer pilotLevel);

    List<Pilot> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT p FROM Pilot p WHERE p.status = :status ORDER BY p.pilotLevel DESC")
    List<Pilot> findAvailablePilotsOrderByLevel(@Param("status") Integer status);

    @Query("SELECT p FROM Pilot p WHERE p.expiryDate < :warningDate AND p.status = 1")
    List<Pilot> findPilotsWithExpiringCertificates(@Param("warningDate") java.time.LocalDate warningDate);

    @Query("SELECT p FROM Pilot p WHERE p.createdAt >= :startDate AND p.createdAt <= :endDate")
    List<Pilot> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(p) FROM Pilot p WHERE p.status = :status")
    Long countByStatus(@Param("status") Integer status);

    boolean existsByEmployeeNo(String employeeNo);
}
