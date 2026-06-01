package com.aics.quality.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("cs_conversation")
public class Conversation {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String sessionId;

    private Long csId;

    private String csName;

    private String customerNo;

    private String customerNickname;

    private String channel;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer duration;

    private Integer messageCount;

    private Integer privacyLevel;

    private Integer qualityStatus;

    private BigDecimal totalScore;

    private Integer hasViolation;

    private String aiEmotion;

    private BigDecimal aiSatisfactionScore;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
