package com.tax.rebate.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("declaration")
public class Declaration {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("declaration_no")
    private String declarationNo;

    @TableField("period")
    private String period;

    @TableField("total_amount")
    private BigDecimal totalAmount;

    @TableField("total_tax_amount")
    private BigDecimal totalTaxAmount;

    @TableField("status")
    private String status;

    @TableField("created_by")
    private Long createdBy;

    @TableField("submitted_at")
    private LocalDateTime submittedAt;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
