package com.aics.quality.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("cs_cs_score")
public class CsScore {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long csId;

    private String csName;

    private String statisticsMonth;

    private Integer totalConversationCount;

    private Integer qualityCount;

    private Integer passCount;

    private Integer violationCount;

    private BigDecimal ruleScore;

    private BigDecimal aiScore;

    private BigDecimal totalScore;

    private Integer avgResponseTime;

    private BigDecimal avgSatisfactionScore;

    private Integer rank;

    private Integer recalculateVersion;

    private LocalDateTime lastRecalculateTime;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
