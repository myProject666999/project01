package com.maritime.pilotage.dto;

import javax.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PilotScheduleCheckRequestDTO {

    @NotNull(message = "引航员ID不能为空")
    private Long pilotId;

    @NotNull(message = "计划引航时间不能为空")
    private LocalDateTime plannedPilotageTime;

    private BigDecimal vesselDeadweightTonnage;

    private Integer vesselLevel;

    private Long orderId;
}
