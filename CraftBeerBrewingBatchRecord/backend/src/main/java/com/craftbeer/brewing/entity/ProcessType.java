package com.craftbeer.brewing.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工序类型实体类
 */
@Data
@TableName("process_type")
public class ProcessType {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String processCode;

    private String processName;

    private Integer processOrder;

    private String description;

    private LocalDateTime createTime;
}
