package com.judicial.appraisal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class EvidenceReceiveRequest {

    @NotNull(message = "委托ID不能为空")
    private Long entrustmentId;

    @NotBlank(message = "检材名称不能为空")
    private String evidenceName;

    private String evidenceType;

    private String description;

    private Integer quantity;

    private BigDecimal weight;

    private String sealStatus;

    private String storageLocation;

    private LocalDateTime receiveTime;

    private Long receivedBy;

    private String deliveredBy;
}
