package com.craftbeer.brewing.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 配方原料明细实体类
 */
@Data
@TableName("recipe_material")
public class RecipeMaterial {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long recipeId;

    private Long materialId;

    private Long materialTypeId;

    private BigDecimal usageAmount;

    private String usageUnit;

    private String addTiming;

    private Integer addOrder;

    private String notes;

    private LocalDateTime createTime;
}
