package com.lawfirm.case_management.enums;

import lombok.Getter;

@Getter
public enum CaseType {
    CIVIL(1, "民事"),
    CRIMINAL(2, "刑事"),
    ADMINISTRATIVE(3, "行政"),
    ARBITRATION(4, "仲裁"),
    OTHER(5, "其他");

    private final int code;
    private final String description;

    CaseType(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public static CaseType fromCode(int code) {
        for (CaseType type : values()) {
            if (type.code == code) {
                return type;
            }
        }
        return OTHER;
    }
}
