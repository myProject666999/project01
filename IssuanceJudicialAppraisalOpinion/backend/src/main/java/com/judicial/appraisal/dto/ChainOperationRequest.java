package com.judicial.appraisal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChainOperationRequest {

    @NotNull(message = "检材ID不能为空")
    private Long evidenceId;

    @NotBlank(message = "操作类型不能为空")
    private String operationType;

    @NotNull(message = "操作时间不能为空")
    private LocalDateTime operationTime;

    @NotNull(message = "操作人员ID不能为空")
    private Long operatorId;

    @NotBlank(message = "操作人员签名不能为空")
    private String operatorSignature;

    private Long counterpartId;

    private String counterpartSignature;

    private String previousSealStatus;

    private String newSealStatus;

    private String remark;
}
