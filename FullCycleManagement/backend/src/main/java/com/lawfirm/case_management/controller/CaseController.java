package com.lawfirm.case_management.controller;

import com.lawfirm.case_management.entity.*;
import com.lawfirm.case_management.enums.CaseStatus;
import com.lawfirm.case_management.service.CaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;

    @GetMapping
    public ResponseEntity<List<LegalCase>> getAllCases() {
        return ResponseEntity.ok(caseService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LegalCase> getCaseById(@PathVariable Long id) {
        Optional<LegalCase> legalCase = caseService.findById(id);
        return legalCase.map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<LegalCase>> getCasesByStatus(@PathVariable CaseStatus status) {
        return ResponseEntity.ok(caseService.findByStatus(status));
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<CaseStatus, Long>> getCaseStatistics() {
        return ResponseEntity.ok(caseService.getCaseStatusCount());
    }

    @PostMapping
    public ResponseEntity<LegalCase> createCase(@RequestBody LegalCase legalCase) {
        return ResponseEntity.ok(caseService.createCase(legalCase));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam CaseStatus newStatus,
            @RequestParam(required = false) String reason) {
        try {
            return ResponseEntity.ok(caseService.updateStatus(id, newStatus, reason != null ? reason : "状态变更"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/status-logs")
    public ResponseEntity<List<CaseStatusLog>> getStatusLogs(@PathVariable Long id) {
        return ResponseEntity.ok(caseService.getCaseStatusLogs(id));
    }

    @GetMapping("/{id}/lawyers")
    public ResponseEntity<List<Lawyer>> getCaseLawyers(@PathVariable Long id) {
        return ResponseEntity.ok(caseService.getCaseLawyers(id));
    }

    @PostMapping("/{id}/lawyers")
    public ResponseEntity<Void> addCaseLawyer(
            @PathVariable Long id,
            @RequestParam Long lawyerId,
            @RequestParam(defaultValue = "1") Integer role) {
        caseService.addCaseLawyer(id, lawyerId, role);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/work-hours")
    public ResponseEntity<List<WorkHour>> getCaseWorkHours(@PathVariable Long id) {
        return ResponseEntity.ok(caseService.getCaseWorkHours(id));
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<List<Document>> getCaseDocuments(@PathVariable Long id) {
        return ResponseEntity.ok(caseService.getCaseDocuments(id));
    }

    @GetMapping("/{id}/court-sessions")
    public ResponseEntity<List<CourtSession>> getCaseCourtSessions(@PathVariable Long id) {
        return ResponseEntity.ok(caseService.getCaseCourtSessions(id));
    }
}
