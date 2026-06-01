package com.lawfirm.case_management.repository;

import com.lawfirm.case_management.entity.LegalCase;
import com.lawfirm.case_management.enums.CaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LegalCaseRepository extends JpaRepository<LegalCase, Long> {

    List<LegalCase> findByStatus(CaseStatus status);

    List<LegalCase> findByCaseType(Integer caseType);

    LegalCase findByCaseNumber(String caseNumber);

    List<LegalCase> findByClientId(Long clientId);

    @Query("SELECT c FROM LegalCase c WHERE c.clientId = :clientId OR c.opposingPartyId = :clientId")
    List<LegalCase> findByClientIdOrOpposingPartyId(Long clientId);

    @Query("SELECT c.status, COUNT(c) FROM LegalCase c GROUP BY c.status")
    List<Object[]> countByStatus();
}
