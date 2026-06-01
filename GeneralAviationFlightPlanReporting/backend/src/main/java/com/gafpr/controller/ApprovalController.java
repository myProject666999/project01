package com.gafpr.controller;

import com.gafpr.entity.ApprovalProcess;
import com.gafpr.service.ApprovalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/approvals")
public class ApprovalController {

    @Autowired
    private ApprovalService approvalService;

    @GetMapping("/flight-plan/{flightPlanId}")
    public ResponseEntity<List<ApprovalProcess>> getByFlightPlan(@PathVariable Long flightPlanId) {
        return ResponseEntity.ok(approvalService.getApprovalProcessByFlightPlan(flightPlanId));
    }

    @GetMapping("/pending/{approverUserId}")
    public ResponseEntity<List<ApprovalProcess>> getPendingApprovals(@PathVariable Long approverUserId) {
        return ResponseEntity.ok(approvalService.getPendingApprovals(approverUserId));
    }

    @PostMapping("/{processId}/approve")
    public ResponseEntity<?> approve(
            @PathVariable Long processId,
            @RequestBody Map<String, Object> request) {
        Long approverUserId = Long.valueOf(request.get("approverUserId").toString());
        String approverName = (String) request.get("approverName");
        String comment = (String) request.get("comment");

        ApprovalProcess result = approvalService.approve(processId, approverUserId, approverName, comment);
        return result != null ? ResponseEntity.ok(result) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{processId}/reject")
    public ResponseEntity<?> reject(
            @PathVariable Long processId,
            @RequestBody Map<String, Object> request) {
        Long approverUserId = Long.valueOf(request.get("approverUserId").toString());
        String approverName = (String) request.get("approverName");
        String comment = (String) request.get("comment");

        ApprovalProcess result = approvalService.reject(processId, approverUserId, approverName, comment);
        return result != null ? ResponseEntity.ok(result) : ResponseEntity.notFound().build();
    }
}
