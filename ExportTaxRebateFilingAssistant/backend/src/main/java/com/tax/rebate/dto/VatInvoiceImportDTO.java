package com.tax.rebate.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class VatInvoiceImportDTO {

    private String invoiceNo;
    private String invoiceCode;
    private String productName;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal amount;
    private BigDecimal taxAmount;
    private String sellerName;
    private String sellerTaxNo;
    private String invoiceDate;
}
