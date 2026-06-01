package com.lawfirm.case_management.service;

import com.lawfirm.case_management.entity.*;
import com.lawfirm.case_management.enums.CaseStatus;
import com.lawfirm.case_management.repository.*;
import com.lawfirm.case_management.statemachine.CaseStateMachine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CaseService {

    private final LegalCaseRepository legalCaseRepository;
    private final CaseStatusLogRepository caseStatusLogRepository;
    private final CaseLawyerRepository caseLawyerRepository;
    private final WorkHourRepository workHourRepository;
    private final DocumentRepository documentRepository;
    private final CourtSessionRepository courtSessionRepository;
    private final CaseStateMachine caseStateMachine;

    public List<LegalCase> findAll() {
        return legalCaseRepository.findAll();
    }

    public Optional<LegalCase> findById(Long id) {
        return legalCaseRepository.findById(id);
    }

    public List<LegalCase> findByStatus(CaseStatus status) {
        return legalCaseRepository.findByStatus(status);
    }

    public Map<CaseStatus, Long> getCaseStatusCount() {
        List<Object[]> results = legalCaseRepository.countByStatus();
        return results.stream()
            .collect(Collectors.toMap(
                row -> (CaseStatus) row[0],
                row -> (Long) row[1]
            ));
    }

    @Transactional
    public LegalCase createCase(LegalCase legalCase) {
        String caseNumber = generateCaseNumber();
        legalCase.setCaseNumber(caseNumber);
        legalCase.setStatus(CaseStatus.CONSULTATION);

        LegalCase saved = legalCaseRepository.save(legalCase);

        CaseStatusLog statusLog = new CaseStatusLog();
        statusLog.setCaseId(saved.getId());
        statusLog.setNewStatus(CaseStatus.CONSULTATION);
        statusLog.setChangeReason("新建案件");
        caseStatusLogRepository.save(statusLog);

        return saved;
    }

    @Transactional
    public LegalCase updateStatus(Long caseId, CaseStatus newStatus, String reason) {
        LegalCase legalCase = legalCaseRepository.findById(caseId)
            .orElseThrow(() -> new IllegalArgumentException("案件不存在: " + caseId));

        CaseStatus currentStatus = legalCase.getStatus();

        if (!caseStateMachine.canTransition(currentStatus, newStatus)) {
            throw new IllegalStateException(
                String.format("非法状态跳转: %s -> %s", currentStatus.getDescription(), newStatus.getDescription())
            );
        }

        if (currentStatus != newStatus) {
            legalCase.setStatus(newStatus);
            updateStatusDate(legalCase, newStatus);
            legalCaseRepository.save(legalCase);

            CaseStatusLog statusLog = new CaseStatusLog();
            statusLog.setCaseId(caseId);
            statusLog.setPreviousStatus(currentStatus);
            statusLog.setNewStatus(newStatus);
            statusLog.setChangeReason(reason);
            caseStatusLogRepository.save(statusLog);

            log.info("案件状态变更: caseId={}, {} -> {}, reason={}",
                caseId, currentStatus, newStatus, reason);
        }

        return legalCase;
    }

    private void updateStatusDate(LegalCase legalCase, CaseStatus status) {
        LocalDate now = LocalDate.now();
        switch (status) {
            case FILED:
                legalCase.setFilingDate(now);
                break;
            case HEARING:
                legalCase.setHearingDate(now);
                break;
            case JUDGED:
                legalCase.setJudgmentDate(now);
                break;
            case CLOSED:
                legalCase.setCloseDate(now);
                break;
            case ARCHIVED:
                legalCase.setArchiveDate(now);
                break;
        }
    }

    public List<CaseStatusLog> getCaseStatusLogs(Long caseId) {
        return caseStatusLogRepository.findByCaseIdOrderByCreatedAtDesc(caseId);
    }

    public List<Lawyer> getCaseLawyers(Long caseId) {
        return caseLawyerRepository.findByCaseId(caseId).stream()
            .map(CaseLawyer::getLawyer)
            .collect(Collectors.toList());
    }

    @Transactional
    public void addCaseLawyer(Long caseId, Long lawyerId, Integer role) {
        CaseLawyer caseLawyer = new CaseLawyer();
        caseLawyer.setCaseId(caseId);
        caseLawyer.setLawyerId(lawyerId);
        caseLawyer.setRole(role);
        caseLawyerRepository.save(caseLawyer);
    }

    public List<WorkHour> getCaseWorkHours(Long caseId) {
        return workHourRepository.findByCaseId(caseId);
    }

    public List<Document> getCaseDocuments(Long caseId) {
        return documentRepository.findByCaseId(caseId);
    }

    public List<CourtSession> getCaseCourtSessions(Long caseId) {
        return courtSessionRepository.findByCaseIdOrderBySessionTimeDesc(caseId);
    }

    private String generateCaseNumber() {
        String year = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy"));
        long count = legalCaseRepository.count() + 1;
        return String.format("CASE%s%04d", year, count);
    }
}
