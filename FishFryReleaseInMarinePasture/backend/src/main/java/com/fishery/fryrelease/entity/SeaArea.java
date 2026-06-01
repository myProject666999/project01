package com.fishery.fryrelease.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("sea_area")
public class SeaArea {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String areaCode;
    private String areaName;
    private BigDecimal areaSize;
    private BigDecimal longitude;
    private BigDecimal latitude;
    private String description;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
