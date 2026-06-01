package com.gafpr.repository;

import com.gafpr.entity.ApprovalProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalProcessRepository extends JpaRepository<ApprovalProcess, Long> {

    List<ApprovalProcess> findByFlightPlanIdOrderBySequenceAsc(Long flightPlanId);

    List<ApprovalProcess> findByFlightPlanIdAndStatus(Long flightPlanId, String status);

    List<ApprovalProcess> findByApproverUserIdAndStatusOrderByCreatedAtDesc(Long approverUserId, String status);
}
