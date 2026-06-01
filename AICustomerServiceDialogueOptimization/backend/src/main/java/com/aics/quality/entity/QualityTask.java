package com.aics.quality.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("cs_quality_task")
public class QualityTask {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String taskNo;

    private String taskName;

    private Integer taskType;

    private Integer qualityType;

    private Integer status;

    private Integer totalCount;

    private Integer processedCount;

    private Integer passCount;

    private Integer violationCount;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime timeRangeStart;

    private LocalDateTime timeRangeEnd;

    private String csIds;

    private String createBy;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
