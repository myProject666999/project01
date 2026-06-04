package com.craftbeer.brewing.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 配方实体类
 */
@Data
@TableName("recipe")
public class Recipe {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String recipeName;

    private String recipeCode;

    private Integer version;

    private Long parentRecipeId;

    private String beerStyle;

    private BigDecimal targetIbu;

    private BigDecimal targetAbv;

    private BigDecimal targetOg;

    private BigDecimal targetFg;

    private BigDecimal batchSizeLiters;

    private String description;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
