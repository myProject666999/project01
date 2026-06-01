package com.maritime.pilotage.repository;

import com.maritime.pilotage.entity.PilotageCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PilotageCompletionRepository extends JpaRepository<PilotageCompletion, Long> {

    Optional<PilotageCompletion> findByCompletionNo(String completionNo);

    List<PilotageCompletion> findByAssignmentId(Long assignmentId);

    List<PilotageCompletion> findByCompletionStatus(Integer completionStatus);

    List<PilotageCompletion> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<PilotageCompletion> findByActualStartTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT pc FROM PilotageCompletion pc WHERE pc.completionStatus = :status AND pc.createdAt BETWEEN :startDate AND :endDate")
    List<PilotageCompletion> findCompletionsByStatusAndDateRange(
            @Param("status") Integer status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT pc FROM PilotageCompletion pc WHERE pc.assignmentId IN :assignmentIds")
    List<PilotageCompletion> findByAssignmentIds(@Param("assignmentIds") List<Long> assignmentIds);

    @Query("SELECT pc FROM PilotageCompletion pc WHERE pc.createdAt >= :startDate AND pc.createdAt <= :endDate")
    List<PilotageCompletion> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(pc.pilotageQuality) FROM PilotageCompletion pc WHERE pc.completionStatus = 2 AND pc.pilotageQuality IS NOT NULL")
    Double calculateAveragePilotageQuality();

    @Query("SELECT COUNT(pc) FROM PilotageCompletion pc WHERE pc.completionStatus = :status")
    Long countByCompletionStatus(@Param("status") Integer status);

    @Query("SELECT COUNT(pc) FROM PilotageCompletion pc WHERE pc.delayReason IS NOT NULL AND pc.createdAt BETWEEN :startDate AND :endDate")
    Long countDelayedCompletionsInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    boolean existsByCompletionNo(String completionNo);
}
