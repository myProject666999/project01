package com.aics.quality.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("cs_script_library")
public class ScriptLibrary {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String scriptCode;

    private Long categoryId;

    private String categoryName;

    private String title;

    private String content;

    private String sceneDesc;

    private String keywords;

    private Integer useCount;

    private Integer likeCount;

    private Integer status;

    private String sourceSessionId;

    private Long creatorId;

    private String creatorName;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
