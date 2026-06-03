package com.tax.rebate.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("customs_declaration")
public class CustomsDeclaration {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("declaration_no")
    private String declarationNo;

    @TableField("hs_code")
    private String hsCode;

    @TableField("product_name")
    private String productName;

    @TableField("quantity")
    private BigDecimal quantity;

    @TableField("unit")
    private String unit;

    @TableField("amount_usd")
    private BigDecimal amountUsd;

    @TableField("amount_cny")
    private BigDecimal amountCny;

    @TableField("currency")
    private String currency;

    @TableField("export_date")
    private LocalDate exportDate;

    @TableField("status")
    private String status;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
