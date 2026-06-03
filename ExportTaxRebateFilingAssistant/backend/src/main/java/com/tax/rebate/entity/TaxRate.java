package com.tax.rebate.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("tax_rate")
public class TaxRate {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("hs_code")
    private String hsCode;

    @TableField("product_name")
    private String productName;

    @TableField("tax_rate")
    private BigDecimal taxRate;

    @TableField("category")
    private String category;

    @TableField("effective_date")
    private LocalDate effectiveDate;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
