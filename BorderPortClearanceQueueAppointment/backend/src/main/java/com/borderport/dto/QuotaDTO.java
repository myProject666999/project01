package com.borderport.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuotaDTO {
    private Long id;
    private Long portId;
    private Long laneId;
    private String vehicleType;
    private LocalDate quotaDate;
    private String timeSlot;
    private Integer baseQuota;
    private Integer adjustedQuota;
    private Integer usedCount;
    private Integer remaining;
}
