package com.craftbeer.brewing.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 酿造批次实体类
 */
@Data
@TableName("brewing_batch")
public class BrewingBatch {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String batchNo;

    private Long recipeId;

    private String batchName;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String brewer;

    private BigDecimal actualBatchSize;

    private String batchStatus;

    private String qualityStatus;

    private String notes;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
