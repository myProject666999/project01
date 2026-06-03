package com.tax.rebate.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("declaration_progress")
public class DeclarationProgress {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("declaration_id")
    private Long declarationId;

    @TableField("step_name")
    private String stepName;

    @TableField("status")
    private String status;

    @TableField("remark")
    private String remark;

    @TableField("operator_id")
    private Long operatorId;

    @TableField("operated_at")
    private LocalDateTime operatedAt;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
