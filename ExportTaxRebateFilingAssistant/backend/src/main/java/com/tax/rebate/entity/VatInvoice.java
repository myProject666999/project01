package com.tax.rebate.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("vat_invoice")
public class VatInvoice {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("invoice_no")
    private String invoiceNo;

    @TableField("invoice_code")
    private String invoiceCode;

    @TableField("product_name")
    private String productName;

    @TableField("quantity")
    private BigDecimal quantity;

    @TableField("unit")
    private String unit;

    @TableField("amount")
    private BigDecimal amount;

    @TableField("tax_amount")
    private BigDecimal taxAmount;

    @TableField("seller_name")
    private String sellerName;

    @TableField("seller_tax_no")
    private String sellerTaxNo;

    @TableField("invoice_date")
    private LocalDate invoiceDate;

    @TableField("status")
    private String status;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
