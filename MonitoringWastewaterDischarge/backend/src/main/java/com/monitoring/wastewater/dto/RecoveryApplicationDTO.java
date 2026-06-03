package com.monitoring.wastewater.dto;

import lombok.Data;

@Data
public class RecoveryApplicationDTO {
    private Long shutdownOrderId;
    private Long pointId;
    private String pointCode;
    private String applicant;
    private String reasonHandled;
    private String testReport;
}
