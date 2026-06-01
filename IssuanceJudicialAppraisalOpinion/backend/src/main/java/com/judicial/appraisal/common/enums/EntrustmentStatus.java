package com.judicial.appraisal.common.enums;

import lombok.Getter;

@Getter
public enum EntrustmentStatus {

    REGISTERED("REGISTERED", "已登记"),
    ACCEPTED("ACCEPTED", "已受理"),
    IN_PROGRESS("IN_PROGRESS", "鉴定中"),
    REVIEWING("REVIEWING", "审核中"),
    COMPLETED("COMPLETED", "已完成"),
    REJECTED("REJECTED", "已退回");

    private final String code;
    private final String desc;

    EntrustmentStatus(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
