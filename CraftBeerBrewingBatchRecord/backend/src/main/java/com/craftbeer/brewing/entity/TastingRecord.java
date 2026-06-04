package com.craftbeer.brewing.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 品测记录实体类
 */
@Data
@TableName("tasting_record")
public class TastingRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long batchId;

    private LocalDateTime tastingTime;

    private String tastingPanel;

    private BigDecimal appearanceScore;

    private BigDecimal aromaScore;

    private BigDecimal flavorScore;

    private BigDecimal mouthfeelScore;

    private BigDecimal overallScore;

    private String finalJudgment;

    private BigDecimal measuredAbv;

    private BigDecimal measuredIbu;

    private BigDecimal measuredColor;

    private String tastingNotes;

    private String defects;

    private String improvementSuggestions;

    private LocalDateTime createTime;
}
