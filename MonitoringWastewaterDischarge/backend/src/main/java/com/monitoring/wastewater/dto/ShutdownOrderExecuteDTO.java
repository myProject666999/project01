package com.monitoring.wastewater.dto;

import lombok.Data;

@Data
public class ShutdownOrderExecuteDTO {
    private Long id;
    private String operatorName;
    private String reasonAnalysis;
    private String processAdjustment;
}
