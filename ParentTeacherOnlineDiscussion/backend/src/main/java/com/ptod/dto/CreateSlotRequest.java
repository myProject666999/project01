package com.ptod.dto;

import javax.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateSlotRequest {

    @NotNull(message = "日期不能为空")
    private LocalDate slotDate;

    @NotNull(message = "开始时间不能为空")
    private LocalTime startTime;

    @NotNull(message = "结束时间不能为空")
    private LocalTime endTime;

    @NotNull(message = "时长不能为空")
    private Integer duration;
}
