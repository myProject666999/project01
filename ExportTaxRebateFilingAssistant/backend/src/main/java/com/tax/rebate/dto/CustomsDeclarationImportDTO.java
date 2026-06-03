package com.tax.rebate.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CustomsDeclarationImportDTO {

    private String declarationNo;
    private String hsCode;
    private String productName;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal amountUsd;
    private BigDecimal amountCny;
    private String currency;
    private String exportDate;
}
