package com.monitoring.wastewater.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("alarm_record")
public class AlarmRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long pointId;
    private String pointCode;
    private String indicator;
    private String indicatorName;
    private BigDecimal currentValue;
    private BigDecimal thresholdValue;
    private Integer alarmLevel;
    private Integer continuousMinutes;
    private LocalDateTime monitorTime;
    private LocalDateTime createTime;
}
