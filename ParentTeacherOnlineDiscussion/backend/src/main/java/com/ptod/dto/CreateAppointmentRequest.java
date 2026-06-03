package com.ptod.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateAppointmentRequest {

    @NotNull(message = "时间段ID不能为空")
    private Long timeSlotId;

    @NotNull(message = "教师ID不能为空")
    private Long teacherId;

    @NotBlank(message = "主题不能为空")
    private String subject;

    private String description;
}
