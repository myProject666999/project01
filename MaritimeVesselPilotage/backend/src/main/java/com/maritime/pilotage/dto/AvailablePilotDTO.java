package com.maritime.pilotage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailablePilotDTO {

    private Long pilotId;

    private String employeeNo;

    private String name;

    private Integer pilotLevel;

    private String pilotLevelName;

    private String phone;

    private Integer status;

    private LocalDateTime nextAvailableTime;

    private Integer consecutiveShiftsCount;

    private Boolean isQualified;

    private Integer workloadScore;
}
