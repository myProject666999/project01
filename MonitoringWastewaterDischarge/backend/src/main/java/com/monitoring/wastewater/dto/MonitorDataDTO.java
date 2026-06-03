package com.monitoring.wastewater.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MonitorDataDTO {
    private Long pointId;
    private String pointCode;
    private BigDecimal codValue;
    private BigDecimal phValue;
    private BigDecimal colorValue;
    private BigDecimal ammoniaValue;
    private LocalDateTime monitorTime;
}
