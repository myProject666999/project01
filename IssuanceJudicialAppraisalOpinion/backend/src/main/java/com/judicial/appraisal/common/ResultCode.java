package com.judicial.appraisal.common;

import lombok.Getter;

@Getter
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    ERROR(500, "系统错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    RATE_LIMITED(429, "请求过于频繁");

    private final Integer code;
    private final String desc;

    ResultCode(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
