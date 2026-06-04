package com.craftbeer.brewing.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 批次工序记录实体类
 */
@Data
@TableName("batch_process_record")
public class BatchProcessRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long batchId;

    private Long processTypeId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private BigDecimal temperature;

    private BigDecimal brix;

    private BigDecimal sg;

    private BigDecimal ph;

    private BigDecimal volume;

    private String operator;

    private String parameters;

    private String notes;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
