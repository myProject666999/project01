package com.monitoring.wastewater.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("env_report_record")
public class EnvReportRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long monitorDataId;
    private Long pointId;
    private String pointCode;
    private String reportContent;
    private Integer reportStatus;
    private LocalDateTime reportTime;
    private String responseContent;
    private Integer retryCount;
    private LocalDateTime createTime;
}
