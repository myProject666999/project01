package com.fishery.fryrelease.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("species")
public class Species {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String speciesName;
    private String speciesCode;
    private String category;
    private String description;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
