package com.tax.rebate.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class DeclarationGenerateDTO {

    @NotBlank(message = "申报期不能为空")
    private String period;
}
