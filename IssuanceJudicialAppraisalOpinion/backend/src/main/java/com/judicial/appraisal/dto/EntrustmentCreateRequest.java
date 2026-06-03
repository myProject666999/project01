package com.judicial.appraisal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EntrustmentCreateRequest {

    @NotBlank(message = "案件名称不能为空")
    private String caseName;

    @NotBlank(message = "鉴定类型不能为空")
    private String appraisalType;

    private String entrustor;

    private String phone;

    private String entrustDate;

    private String caseSummary;

    private String appraisalRequirements;
}
