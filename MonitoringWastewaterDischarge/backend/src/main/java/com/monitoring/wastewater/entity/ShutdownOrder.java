package com.monitoring.wastewater.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("shutdown_order")
public class ShutdownOrder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderNo;
    private Long pointId;
    private String pointCode;
    private String triggerIndicator;
    private String triggerIndicatorName;
    private BigDecimal triggerValue;
    private BigDecimal thresholdValue;
    private Integer continuousMinutes;
    private Integer orderStatus;
    private String operatorName;
    private LocalDateTime confirmTime;
    private LocalDateTime executeTime;
    private String reasonAnalysis;
    private String processAdjustment;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
