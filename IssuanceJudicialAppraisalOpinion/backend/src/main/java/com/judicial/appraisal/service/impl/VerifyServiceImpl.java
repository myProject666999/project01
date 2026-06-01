package com.judicial.appraisal.service.impl;

import com.judicial.appraisal.common.Result;
import com.judicial.appraisal.common.enums.VerifyResult;
import com.judicial.appraisal.entity.Entrustment;
import com.judicial.appraisal.entity.Opinion;
import com.judicial.appraisal.entity.SysUser;
import com.judicial.appraisal.entity.VerifyLog;
import com.judicial.appraisal.repository.EntrustmentRepository;
import com.judicial.appraisal.repository.OpinionRepository;
import com.judicial.appraisal.repository.SysUserRepository;
import com.judicial.appraisal.repository.VerifyLogRepository;
import com.judicial.appraisal.service.VerifyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VerifyServiceImpl implements VerifyService {

    @Autowired
    private OpinionRepository opinionRepository;

    @Autowired
    private VerifyLogRepository verifyLogRepository;

    @Autowired
    private EntrustmentRepository entrustmentRepository;

    @Autowired
    private SysUserRepository sysUserRepository;

    @Override
    @Transactional
    public Result<Map<String, Object>> verifyOpinion(String verifyCode, String clientIp, String userAgent) {
        Opinion opinion = opinionRepository.findByVerifyCode(verifyCode).orElse(null);

        VerifyLog log = new VerifyLog();
        log.setVerifyCode(verifyCode);
        log.setClientIp(clientIp);
        log.setUserAgent(userAgent);
        log.setVerifyTime(LocalDateTime.now());

        if (opinion == null) {
            log.setResult(VerifyResult.FAILED.getCode());
            verifyLogRepository.save(log);
            return Result.error("验真失败：验证码无效或意见书不存在");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("opinionNo", opinion.getOpinionNo());
        data.put("title", opinion.getTitle());
        data.put("issueDate", opinion.getIssueDate());
        data.put("status", opinion.getStatus());

        List<String> appraisers = new ArrayList<>();
        if (opinion.getAppraiser1Id() != null) {
            sysUserRepository.findById(opinion.getAppraiser1Id()).ifPresent(user ->
                    appraisers.add(user.getRealName()));
        }
        if (opinion.getAppraiser2Id() != null) {
            sysUserRepository.findById(opinion.getAppraiser2Id()).ifPresent(user ->
                    appraisers.add(user.getRealName()));
        }
        data.put("appraisers", appraisers);

        Entrustment entrustment = entrustmentRepository.findById(opinion.getEntrustmentId()).orElse(null);
        if (entrustment != null) {
            Map<String, Object> entrustmentInfo = new HashMap<>();
            entrustmentInfo.put("entrustmentNo", entrustment.getEntrustmentNo());
            entrustmentInfo.put("caseName", entrustment.getCaseName());
            entrustmentInfo.put("appraisalType", entrustment.getAppraisalType());
            entrustmentInfo.put("appraisalMatter", entrustment.getAppraisalMatter());
            data.put("entrustment", entrustmentInfo);
        }

        log.setResult(VerifyResult.SUCCESS.getCode());
        verifyLogRepository.save(log);

        return Result.success(data);
    }

    @Override
    public List<VerifyLog> getVerifyLogs(String verifyCode) {
        return verifyLogRepository.findByVerifyCodeOrderByVerifyTimeDesc(verifyCode);
    }
}
