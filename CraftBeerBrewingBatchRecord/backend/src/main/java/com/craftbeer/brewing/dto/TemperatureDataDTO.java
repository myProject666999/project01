package com.craftbeer.brewing.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 温度数据DTO（时序温度点数据）
 */
@Data
public class TemperatureDataDTO {

    private Long id;

    private Long batchId;

    private LocalDateTime recordTime;

    private BigDecimal tankTemperature;

    private BigDecimal coolantTemperature;

    private BigDecimal ambientTemperature;

    private BigDecimal pressure;

    private BigDecimal sg;

    private String notes;
}
