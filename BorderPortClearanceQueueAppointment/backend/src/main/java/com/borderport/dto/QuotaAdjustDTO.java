package com.borderport.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuotaAdjustDTO {
    private Long portId;
    private String vehicleType;
    private LocalDate date;
    private String timeSlot;
    private Integer delta;
}
