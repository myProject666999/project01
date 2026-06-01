package com.lawfirm.case_management.repository;

import com.lawfirm.case_management.entity.CaseStatusLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseStatusLogRepository extends JpaRepository<CaseStatusLog, Long> {

    List<CaseStatusLog> findByCaseIdOrderByCreatedAtDesc(Long caseId);
}
