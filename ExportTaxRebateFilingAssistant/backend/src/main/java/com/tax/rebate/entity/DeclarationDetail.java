package com.tax.rebate.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@TableName("declaration_detail")
public class DeclarationDetail {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("declaration_id")
    private Long declarationId;

    @TableField("matching_id")
    private Long matchingId;

    @TableField("hs_code")
    private String hsCode;

    @TableField("product_name")
    private String productName;

    @TableField("invoice_amount")
    private BigDecimal invoiceAmount;

    @TableField("tax_rate")
    private BigDecimal taxRate;

    @TableField("tax_amount")
    private BigDecimal taxAmount;

    @TableField("sort_order")
    private Integer sortOrder;
}
