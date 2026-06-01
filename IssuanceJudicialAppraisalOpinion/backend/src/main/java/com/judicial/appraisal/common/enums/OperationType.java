package com.judicial.appraisal.common.enums;

import lombok.Getter;

@Getter
public enum OperationType {

    RECEIVE("RECEIVE", "接收"),
    SEAL("SEAL", "封存"),
    UNSEAL("UNSEAL", "启封"),
    TRANSFER("TRANSFER", "流转"),
    INSPECT("INSPECT", "检验"),
    RETURN("RETURN", "退还");

    private final String code;
    private final String desc;

    OperationType(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
