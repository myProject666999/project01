package com.craftbeer.brewing.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 批次追溯实体类
 */
@Data
@TableName("batch_traceability")
public class BatchTraceability {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long batchId;

    private String traceType;

    private String traceResult;

    private String rootCause;

    private String rootCauseCategory;

    private String affectedMaterials;

    private String affectedProcesses;

    private String correctiveActions;

    private String tracedBy;

    private LocalDateTime traceTime;

    private LocalDateTime createTime;
}
