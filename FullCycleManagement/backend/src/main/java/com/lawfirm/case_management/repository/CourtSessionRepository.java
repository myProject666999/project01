package com.lawfirm.case_management.repository;

import com.lawfirm.case_management.entity.CourtSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CourtSessionRepository extends JpaRepository<CourtSession, Long> {

    List<CourtSession> findByCaseId(Long caseId);

    List<CourtSession> findByCaseIdOrderBySessionTimeDesc(Long caseId);

    List<CourtSession> findBySessionTimeBetween(LocalDateTime start, LocalDateTime end);
}
