package com.lawfirm.case_management.enums;

import lombok.Getter;

@Getter
public enum CaseStatus {
    CONSULTATION("咨询接洽"),
    ACCEPTED("已接受委托"),
    FILING("立案中"),
    FILED("已立案"),
    HEARING("庭审中"),
    JUDGED("已判决"),
    EXECUTION("执行中"),
    CLOSED("已结案"),
    ARCHIVED("已归档");

    private final String description;

    CaseStatus(String description) {
        this.description = description;
    }
}
