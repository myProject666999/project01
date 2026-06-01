package com.aics.quality.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("cs_conversation_message")
public class ConversationMessage {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String sessionId;

    private String msgId;

    private Integer senderType;

    private String senderName;

    private String content;

    private LocalDateTime sendTime;

    private Integer responseTime;

    private Integer isDesensitized;

    private LocalDateTime createTime;
}
