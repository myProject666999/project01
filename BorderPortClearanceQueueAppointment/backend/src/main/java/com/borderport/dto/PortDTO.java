package com.borderport.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortDTO {
    private Long id;
    private String name;
    private String code;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer radius;
    private String status;
    private Integer cargoLaneCount;
    private Integer passengerLaneCount;
    private String currentCongestionLevel;
}
