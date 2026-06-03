package com.monitoring.wastewater.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("recovery_application")
public class RecoveryApplication {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String applicationNo;
    private Long shutdownOrderId;
    private Long pointId;
    private String pointCode;
    private String applicant;
    private String reasonHandled;
    private String testReport;
    private Integer applicationStatus;
    private String approver;
    private String approvalOpinion;
    private LocalDateTime approvalTime;
    private LocalDateTime recoveryTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
