package com.judicial.appraisal.common.enums;

import lombok.Getter;

@Getter
public enum SealStatus {

    SEALED("SEALED", "已封存"),
    UNSEALED("UNSEALED", "已启封"),
    RETURNED("RETURNED", "已退还");

    private final String code;
    private final String desc;

    SealStatus(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
