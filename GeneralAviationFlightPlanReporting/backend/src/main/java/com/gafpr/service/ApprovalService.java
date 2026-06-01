package com.gafpr.service;

import com.gafpr.entity.ApprovalProcess;
import com.gafpr.entity.FlightPlan;
import com.gafpr.repository.ApprovalProcessRepository;
import com.gafpr.repository.FlightPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApprovalService {

    @Autowired
    private ApprovalProcessRepository approvalProcessRepository;

    @Autowired
    private FlightPlanRepository flightPlanRepository;

    public List<ApprovalProcess> getApprovalProcessByFlightPlan(Long flightPlanId) {
        return approvalProcessRepository.findByFlightPlanIdOrderBySequenceAsc(flightPlanId);
    }

    public List<ApprovalProcess> getPendingApprovals(Long approverUserId) {
        return approvalProcessRepository.findByApproverUserIdAndStatusOrderByCreatedAtDesc(approverUserId, "PENDING");
    }

    @Transactional
    public ApprovalProcess approve(Long processId, Long approverUserId, String approverName, String comment) {
        ApprovalProcess process = approvalProcessRepository.findById(processId).orElse(null);
        if (process == null || !"PENDING".equals(process.getStatus())) {
            return null;
        }

        process.setApproverUserId(approverUserId);
        process.setApproverName(approverName);
        process.setStatus("APPROVED");
        process.setComment(comment);
        process.setProcessTime(LocalDateTime.now());
        approvalProcessRepository.save(process);

        checkAndUpdateFlightPlanStatus(process.getFlightPlanId());

        return process;
    }

    @Transactional
    public ApprovalProcess reject(Long processId, Long approverUserId, String approverName, String comment) {
        ApprovalProcess process = approvalProcessRepository.findById(processId).orElse(null);
        if (process == null || !"PENDING".equals(process.getStatus())) {
            return null;
        }

        process.setApproverUserId(approverUserId);
        process.setApproverName(approverName);
        process.setStatus("REJECTED");
        process.setComment(comment);
        process.setProcessTime(LocalDateTime.now());
        approvalProcessRepository.save(process);

        FlightPlan flightPlan = flightPlanRepository.findById(process.getFlightPlanId()).orElse(null);
        if (flightPlan != null) {
            flightPlan.setStatus("REJECTED");
            flightPlanRepository.save(flightPlan);
        }

        return process;
    }

    private void checkAndUpdateFlightPlanStatus(Long flightPlanId) {
        List<ApprovalProcess> processes = approvalProcessRepository.findByFlightPlanIdOrderBySequenceAsc(flightPlanId);
        boolean allApproved = true;
        for (ApprovalProcess p : processes) {
            if (!"APPROVED".equals(p.getStatus())) {
                allApproved = false;
                break;
            }
        }

        if (allApproved) {
            FlightPlan flightPlan = flightPlanRepository.findById(flightPlanId).orElse(null);
            if (flightPlan != null) {
                flightPlan.setStatus("APPROVED");
                flightPlan.setApproveTime(LocalDateTime.now());
                flightPlanRepository.save(flightPlan);
            }
        }
    }
}
