package com.judicial.appraisal.common.enums;

import lombok.Getter;

@Getter
public enum VerifyResult {

    SUCCESS("SUCCESS", "验证成功"),
    FAILED("FAILED", "验证失败"),
    RATE_LIMITED("RATE_LIMITED", "验证次数超限");

    private final String code;
    private final String desc;

    VerifyResult(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
