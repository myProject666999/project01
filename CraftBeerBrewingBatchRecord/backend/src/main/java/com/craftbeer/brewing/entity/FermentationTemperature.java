package com.craftbeer.brewing.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 发酵温度记录实体类（时序数据）
 */
@Data
@TableName("fermentation_temperature")
public class FermentationTemperature {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long batchId;

    private LocalDateTime recordTime;

    private BigDecimal tankTemperature;

    private BigDecimal coolantTemperature;

    private BigDecimal ambientTemperature;

    private BigDecimal pressure;

    private BigDecimal sg;

    private String notes;

    private LocalDateTime createTime;
}
