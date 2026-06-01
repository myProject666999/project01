package com.judicial.appraisal.common.enums;

import lombok.Getter;

@Getter
public enum AppraisalType {

    FORENSIC("FORENSIC", "法医"),
    TRACE("TRACE", "痕迹"),
    ELECTRONIC("ELECTRONIC", "电子数据");

    private final String code;
    private final String desc;

    AppraisalType(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
