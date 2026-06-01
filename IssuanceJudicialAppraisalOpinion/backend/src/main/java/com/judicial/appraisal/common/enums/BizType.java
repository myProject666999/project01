package com.judicial.appraisal.common.enums;

import lombok.Getter;

@Getter
public enum BizType {

    EVIDENCE("EVIDENCE", "检材管理"),
    INSPECTION("INSPECTION", "检验记录"),
    OPINION("OPINION", "鉴定意见书");

    private final String code;
    private final String desc;

    BizType(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
