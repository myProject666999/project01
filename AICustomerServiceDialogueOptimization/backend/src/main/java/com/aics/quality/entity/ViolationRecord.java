package com.aics.quality.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("cs_violation_record")
public class ViolationRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String violationNo;

    private String sessionId;

    private Long csId;

    private String csName;

    private Long ruleId;

    private String ruleName;

    private Integer violationType;

    private Integer violationLevel;

    private BigDecimal deductScore;

    private String hitContent;

    private Integer status;

    private Integer canAppeal;

    private Integer isAppealed;

    private LocalDateTime confirmTime;

    private String confirmBy;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
