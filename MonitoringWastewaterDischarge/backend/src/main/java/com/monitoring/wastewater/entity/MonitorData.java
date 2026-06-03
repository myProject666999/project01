package com.monitoring.wastewater.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("monitor_data")
public class MonitorData {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long pointId;
    private String pointCode;
    private BigDecimal codValue;
    private BigDecimal phValue;
    private BigDecimal colorValue;
    private BigDecimal ammoniaValue;
    private Integer isOverLimit;
    private String overLimitIndicators;
    private LocalDateTime monitorTime;
    private Integer reportStatus;
    private LocalDateTime reportTime;
    private LocalDateTime createTime;
}
