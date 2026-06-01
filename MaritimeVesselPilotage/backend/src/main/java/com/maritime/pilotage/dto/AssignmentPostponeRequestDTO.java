package com.maritime.pilotage.dto;

import javax.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentPostponeRequestDTO {

    @NotNull(message = "原任务ID不能为空")
    private Long originalAssignmentId;

    @NotNull(message = "新计划引航时间不能为空")
    private LocalDateTime newPlannedPilotageTime;

    private LocalDateTime newTideWindowStart;

    private LocalDateTime newTideWindowEnd;

    private String postponeReason;

    private Long newPilotId;

    private String operator;
}
