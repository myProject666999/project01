package com.fishery.fryrelease.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("water_quality")
public class WaterQuality {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long areaId;
    private BigDecimal salinity;
    private BigDecimal temperature;
    private BigDecimal dissolvedOxygen;
    private BigDecimal phValue;
    private LocalDateTime monitorTime;
    private String remarks;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @TableField(exist = false)
    private String areaName;
}
