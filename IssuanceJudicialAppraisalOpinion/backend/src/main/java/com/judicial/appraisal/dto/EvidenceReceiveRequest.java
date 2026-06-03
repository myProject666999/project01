package com.judicial.appraisal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EvidenceReceiveRequest {

    @NotNull(message = "委托ID不能为空")
    private Long entrustmentId;

    @NotBlank(message = "检材名称不能为空")
    private String name;

    private String type;

    private Integer quantity;

    private String weight;

    private String weightUnit;

    private String storageLocation;

    private String description;

    private String location;

    private String sealedStatus;
}
