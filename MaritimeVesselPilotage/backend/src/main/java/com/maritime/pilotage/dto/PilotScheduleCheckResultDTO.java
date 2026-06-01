package com.maritime.pilotage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PilotScheduleCheckResultDTO {

    private Long pilotId;

    private String pilotName;

    private Integer pilotLevel;

    private Boolean isAvailable;

    private Boolean isQualified;

    private Boolean hasConsecutiveShifts;

    private List<String> violationMessages;

    private LocalDateTime previousShiftEnd;

    private LocalDateTime nextShiftStart;

    private Long recommendedPilotId;

    private String recommendedPilotName;
}
