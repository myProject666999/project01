package com.craftbeer.brewing.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 原料实体类
 */
@Data
@TableName("material")
public class Material {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long materialTypeId;

    private String materialName;

    private String materialCode;

    private String supplier;

    private String origin;

    private String specification;

    private String description;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
