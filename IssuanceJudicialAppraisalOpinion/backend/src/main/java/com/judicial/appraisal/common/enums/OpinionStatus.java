package com.judicial.appraisal.common.enums;

import lombok.Getter;

@Getter
public enum OpinionStatus {

    DRAFT("DRAFT", "草稿"),
    REVIEW1("REVIEW1", "一级审核"),
    REVIEW2("REVIEW2", "二级审核"),
    REVIEW3("REVIEW3", "三级审核"),
    REJECTED("REJECTED", "已退回"),
    ISSUED("ISSUED", "已出具");

    private final String code;
    private final String desc;

    OpinionStatus(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
