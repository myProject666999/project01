package com.aics.quality.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("cs_quality_result_rule")
public class QualityResultRule {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long taskId;

    private String sessionId;

    private Long ruleId;

    private String ruleCode;

    private String ruleName;

    private Integer ruleType;

    private Integer isPass;

    private BigDecimal deductScore;

    private Integer violationLevel;

    private String hitContent;

    private String hitMessageId;

    private String remark;

    private LocalDateTime qualityTime;
}
