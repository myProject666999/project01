package com.tax.rebate.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("matching_result")
public class MatchingResult {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("customs_id")
    private Long customsId;

    @TableField("invoice_id")
    private Long invoiceId;

    @TableField("match_score")
    private Double matchScore;

    @TableField("match_type")
    private String matchType;

    @TableField("status")
    private String status;

    @TableField("remark")
    private String remark;

    @TableField("confirmed_by")
    private String confirmedBy;

    @TableField("confirmed_at")
    private LocalDateTime confirmedAt;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
