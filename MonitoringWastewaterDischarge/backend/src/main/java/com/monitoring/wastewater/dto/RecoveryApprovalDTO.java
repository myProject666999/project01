package com.monitoring.wastewater.dto;

import lombok.Data;

@Data
public class RecoveryApprovalDTO {
    private Long id;
    private Integer applicationStatus;
    private String approver;
    private String approvalOpinion;
}
