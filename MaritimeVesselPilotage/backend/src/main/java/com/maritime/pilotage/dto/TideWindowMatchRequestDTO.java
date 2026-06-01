package com.maritime.pilotage.dto;

import javax.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TideWindowMatchRequestDTO {

    @NotNull(message = "船舶ID不能为空")
    private Long vesselId;

    @NotNull(message = "预计吃水不能为空")
    private BigDecimal etaDraft;

    @NotNull(message = "预计抵达时间不能为空")
    private LocalDateTime eta;

    private LocalDate searchStartDate;

    private LocalDate searchEndDate;

    private String port;
}
