package com.maritime.pilotage.repository;

import com.maritime.pilotage.entity.AssignmentTug;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AssignmentTugRepository extends JpaRepository<AssignmentTug, Long> {

    List<AssignmentTug> findByAssignmentId(Long assignmentId);

    List<AssignmentTug> findByTugId(Long tugId);

    List<AssignmentTug> findByAssignedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT at FROM AssignmentTug at WHERE at.assignmentId = :assignmentId AND at.tugId = :tugId")
    AssignmentTug findByAssignmentIdAndTugId(@Param("assignmentId") Long assignmentId, @Param("tugId") Long tugId);

    @Query("SELECT at FROM AssignmentTug at WHERE at.assignedAt >= :startDate AND at.assignedAt <= :endDate")
    List<AssignmentTug> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(at) FROM AssignmentTug at WHERE at.assignmentId = :assignmentId")
    Long countByAssignmentId(@Param("assignmentId") Long assignmentId);
}
