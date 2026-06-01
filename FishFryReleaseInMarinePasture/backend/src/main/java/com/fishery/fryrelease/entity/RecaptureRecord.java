package com.fishery.fryrelease.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("recapture_record")
public class RecaptureRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long areaId;
    private Long speciesId;
    private String vesselName;
    private String sizeGrade;
    private BigDecimal catchWeight;
    private Integer catchCount;
    private LocalDate catchDate;
    private String remarks;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @TableField(exist = false)
    private String areaName;
    @TableField(exist = false)
    private String speciesName;
}
