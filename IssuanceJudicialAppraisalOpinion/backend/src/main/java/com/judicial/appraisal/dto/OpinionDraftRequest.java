package com.judicial.appraisal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OpinionDraftRequest {

    @NotNull(message = "委托ID不能为空")
    private Long entrustmentId;

    @NotBlank(message = "意见书标题不能为空")
    private String title;

    private String basicInfo;

    private String inspectionInfo;

    private String analysisDescription;

    private String conclusion;

    private Long appraiser1Id;

    private Long appraiser2Id;
}
