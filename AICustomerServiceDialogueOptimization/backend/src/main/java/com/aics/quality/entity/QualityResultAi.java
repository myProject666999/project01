package com.aics.quality.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("cs_quality_result_ai")
public class QualityResultAi {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long taskId;

    private String sessionId;

    private String emotion;

    private BigDecimal emotionConfidence;

    private BigDecimal satisfactionScore;

    private BigDecimal serviceAttitudeScore;

    private BigDecimal professionalScore;

    private BigDecimal responseTimelinessScore;

    private String aiSummary;

    private String riskTags;

    private LocalDateTime qualityTime;
}
