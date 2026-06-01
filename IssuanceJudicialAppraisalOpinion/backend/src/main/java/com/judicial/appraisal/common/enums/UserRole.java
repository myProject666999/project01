package com.judicial.appraisal.common.enums;

import lombok.Getter;

@Getter
public enum UserRole {

    ADMIN("ADMIN", "管理员"),
    APPRAISER("APPRAISER", "鉴定人"),
    REVIEWER1("REVIEWER1", "一级审核人"),
    REVIEWER2("REVIEWER2", "二级审核人"),
    REVIEWER3("REVIEWER3", "三级审核人");

    private final String code;
    private final String desc;

    UserRole(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
