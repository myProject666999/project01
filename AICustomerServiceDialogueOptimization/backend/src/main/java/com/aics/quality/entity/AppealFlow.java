package com.aics.quality.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("cs_appeal_flow")
public class AppealFlow {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long appealId;

    private Long operatorId;

    private String operatorName;

    private String action;

    private String remark;

    private LocalDateTime createTime;
}
