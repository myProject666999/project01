package com.craftbeer.brewing.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 原料类型实体类
 */
@Data
@TableName("material_type")
public class MaterialType {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String typeCode;

    private String typeName;

    private String description;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
