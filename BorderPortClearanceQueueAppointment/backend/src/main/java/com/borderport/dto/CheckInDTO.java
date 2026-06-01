package com.borderport.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckInDTO {
    private String appointmentNo;
    private String plateNumber;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
