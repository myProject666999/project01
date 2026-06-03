package com.monitoring.wastewater.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("discharge_point")
public class DischargePoint {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String pointCode;
    private String pointName;
    private String location;
    private String description;
    private BigDecimal codThreshold;
    private BigDecimal phMinThreshold;
    private BigDecimal phMaxThreshold;
    private BigDecimal colorThreshold;
    private BigDecimal ammoniaThreshold;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
