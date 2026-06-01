package com.aics.quality.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("cs_appeal")
public class Appeal {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String appealNo;

    private Long violationId;

    private String sessionId;

    private Long appellantId;

    private String appellantName;

    private String appealReason;

    private String appealEvidence;

    private Integer status;

    private Long auditorId;

    private String auditorName;

    private String auditOpinion;

    private LocalDateTime submitTime;

    private LocalDateTime auditTime;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
