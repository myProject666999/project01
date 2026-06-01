package com.fishery.fryrelease.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("release_record")
public class ReleaseRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long planId;
    private Long areaId;
    private Long speciesId;
    private String vesselName;
    private String weatherCondition;
    private LocalDateTime releaseTime;
    private Long actualQuantity;
    private String remarks;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @TableField(exist = false)
    private String areaName;
    @TableField(exist = false)
    private String speciesName;
    @TableField(exist = false)
    private String planName;
}
