package com.judicial.appraisal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EntrustmentRegisterRequest {

    @NotNull(message = "委托人ID不能为空")
    private Long clientId;

    @NotBlank(message = "案件名称不能为空")
    private String caseName;

    private String caseDescription;

    @NotBlank(message = "鉴定类型不能为空")
    private String appraisalType;

    @NotBlank(message = "鉴定事项不能为空")
    private String appraisalMatter;

    @NotNull(message = "委托日期不能为空")
    private LocalDate entrustDate;

    private LocalDate deadline;
}
