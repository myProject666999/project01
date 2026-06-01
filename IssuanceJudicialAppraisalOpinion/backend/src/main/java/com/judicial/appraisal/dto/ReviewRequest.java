package com.judicial.appraisal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewRequest {

    @NotNull(message = "意见书ID不能为空")
    private Long opinionId;

    @NotNull(message = "复核级别不能为空")
    private Integer reviewLevel;

    @NotNull(message = "复核人ID不能为空")
    private Long reviewerId;

    private String reviewerSignature;

    @NotBlank(message = "复核结果不能为空")
    private String result;

    private Integer rejectTargetLevel;

    private String opinion;

    private LocalDateTime reviewTime;
}
