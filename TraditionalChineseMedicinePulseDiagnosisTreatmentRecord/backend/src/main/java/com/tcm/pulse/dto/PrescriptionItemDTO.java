package com.tcm.pulse.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PrescriptionItemDTO {

    private Long id;

    private Long herbId;

    @NotBlank(message = "药材名称不能为空")
    private String herbName;

    @NotNull(message = "用量不能为空")
    private BigDecimal dosage;

    private String preparationMethod;
}
