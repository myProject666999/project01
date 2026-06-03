package com.tax.rebate.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class ManualMatchDTO {

    @NotNull(message = "报关单ID不能为空")
    private Long customsId;

    @NotNull(message = "发票ID不能为空")
    private Long invoiceId;
}
