package com.judicial.appraisal.common.enums;

import lombok.Getter;

@Getter
public enum ReviewResult {

    PASS("PASS", "通过"),
    REJECT("REJECT", "退回");

    private final String code;
    private final String desc;

    ReviewResult(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
