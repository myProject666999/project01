package com.judicial.appraisal.service;

import com.judicial.appraisal.common.Result;
import com.judicial.appraisal.entity.VerifyLog;

import java.util.List;
import java.util.Map;

public interface VerifyService {

    Result<Map<String, Object>> verifyOpinion(String verifyCode, String clientIp, String userAgent);

    List<VerifyLog> getVerifyLogs(String verifyCode);
}
