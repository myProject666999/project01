package com.fishery.fryrelease.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("release_plan")
public class ReleasePlan {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long areaId;
    private Long speciesId;
    private Integer planYear;
    private String planSeason;
    private Long planQuantity;
    private String status;
    private String remarks;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @TableField(exist = false)
    private String areaName;
    @TableField(exist = false)
    private String speciesName;
}
