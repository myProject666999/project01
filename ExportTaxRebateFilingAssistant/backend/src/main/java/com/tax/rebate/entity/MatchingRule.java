package com.tax.rebate.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("matching_rule")
public class MatchingRule {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("rule_name")
    private String ruleName;

    @TableField("name_similarity_threshold")
    private BigDecimal nameSimilarityThreshold;

    @TableField("amount_tolerance_rate")
    private BigDecimal amountToleranceRate;

    @TableField("quantity_tolerance_rate")
    private BigDecimal quantityToleranceRate;

    @TableField("enabled")
    private Boolean enabled;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
