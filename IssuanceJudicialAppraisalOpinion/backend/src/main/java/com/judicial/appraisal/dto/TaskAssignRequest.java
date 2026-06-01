package com.judicial.appraisal.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskAssignRequest {

    @NotNull(message = "委托ID不能为空")
    private Long entrustmentId;

    @NotNull(message = "检材ID不能为空")
    private Long evidenceId;

    @NotNull(message = "鉴定人ID不能为空")
    private Long appraiserId;

    private Long assistantId;

    private String taskDescription;

    private LocalDateTime assignTime;
}
