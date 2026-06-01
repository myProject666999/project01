package com.aics.quality.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("cs_quality_rule")
public class QualityRule {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String ruleCode;

    private String ruleName;

    private Integer ruleType;

    private String ruleContent;

    private BigDecimal scoreWeight;

    private BigDecimal deductScore;

    private Integer violationLevel;

    private Integer isEnabled;

    private String createBy;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
