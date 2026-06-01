package com.judicial.appraisal.service.impl;

import com.judicial.appraisal.entity.InspectionRecord;
import com.judicial.appraisal.entity.SysUser;
import com.judicial.appraisal.repository.InspectionRecordRepository;
import com.judicial.appraisal.repository.SysUserRepository;
import com.judicial.appraisal.service.InspectionRecordService;
import com.judicial.appraisal.util.NoGenerator;
import com.judicial.appraisal.util.Pkcs7Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class InspectionRecordServiceImpl implements InspectionRecordService {

    private static final String SIGN_PASSWORD = "123456";

    @Autowired
    private InspectionRecordRepository inspectionRecordRepository;

    @Autowired
    private SysUserRepository sysUserRepository;

    @Override
    @Transactional
    public InspectionRecord createRecord(InspectionRecord record, Long appraiserId) {
        SysUser appraiser = sysUserRepository.findById(appraiserId)
                .orElseThrow(() -> new IllegalArgumentException("鉴定人不存在，ID: " + appraiserId));

        if (record.getTaskId() == null) {
            throw new IllegalArgumentException("任务ID不能为空");
        }

        if (record.getEvidenceId() == null) {
            throw new IllegalArgumentException("检材ID不能为空");
        }

        record.setRecordNo(NoGenerator.generateRecordNo());
        record.setInspectionDate(LocalDate.now());
        record.setAppraiserId(appraiserId);

        String signData = buildSignData(record);
        String appraiserSignature = Pkcs7Util.generateSignature(signData, SIGN_PASSWORD);
        record.setAppraiserSignature(appraiserSignature);

        if (record.getAssistantId() != null) {
            SysUser assistant = sysUserRepository.findById(record.getAssistantId())
                    .orElseThrow(() -> new IllegalArgumentException("助手不存在，ID: " + record.getAssistantId()));
            String assistantSignature = Pkcs7Util.generateSignature(signData, SIGN_PASSWORD);
            record.setAssistantSignature(assistantSignature);
        }

        return inspectionRecordRepository.save(record);
    }

    @Override
    public InspectionRecord findById(Long id) {
        return inspectionRecordRepository.findById(id).orElse(null);
    }

    @Override
    public List<InspectionRecord> findAll() {
        return inspectionRecordRepository.findAll();
    }

    @Override
    public List<InspectionRecord> findByTaskId(Long taskId) {
        return inspectionRecordRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
    }

    @Override
    public List<InspectionRecord> findByEvidenceId(Long evidenceId) {
        return inspectionRecordRepository.findByEvidenceIdOrderByCreatedAtDesc(evidenceId);
    }

    private String buildSignData(InspectionRecord record) {
        return record.getTaskId() + "|" +
                record.getEvidenceId() + "|" +
                record.getInspectionDate() + "|" +
                record.getAppraiserId() + "|" +
                (record.getAssistantId() != null ? record.getAssistantId() : "") + "|" +
                (record.getInspectionLocation() != null ? record.getInspectionLocation() : "") + "|" +
                (record.getMethod() != null ? record.getMethod() : "") + "|" +
                (record.getResult() != null ? record.getResult() : "");
    }
}
