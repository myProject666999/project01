package com.lawfirm.case_management.controller;

import com.lawfirm.case_management.service.ConflictCheckService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conflict-check")
@RequiredArgsConstructor
public class ConflictCheckController {

    private final ConflictCheckService conflictCheckService;

    @GetMapping
    public ResponseEntity<ConflictCheckService.ConflictCheckResult> checkConflict(
            @RequestParam String clientName) {
        return ResponseEntity.ok(conflictCheckService.checkConflict(clientName));
    }
}
