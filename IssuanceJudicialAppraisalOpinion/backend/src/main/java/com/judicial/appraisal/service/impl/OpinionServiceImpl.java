package com.judicial.appraisal.service.impl;

import com.judicial.appraisal.common.enums.OpinionStatus;
import com.judicial.appraisal.common.enums.UserRole;
import com.judicial.appraisal.entity.Opinion;
import com.judicial.appraisal.entity.SysUser;
import com.judicial.appraisal.repository.OpinionRepository;
import com.judicial.appraisal.repository.SysUserRepository;
import com.judicial.appraisal.service.OpinionService;
import com.judicial.appraisal.util.NoGenerator;
import com.judicial.appraisal.util.Pkcs7Util;
import com.judicial.appraisal.util.QrCodeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class OpinionServiceImpl implements OpinionService {

    @Autowired
    private OpinionRepository opinionRepository;

    @Autowired
    private SysUserRepository sysUserRepository;

    @Value("${appraisal.qrcode.path:./qrcodes}")
    private String qrCodePath;

    @Override
    @Transactional
    public Opinion createDraft(Opinion opinion, Long createdBy) {
        opinion.setOpinionNo(NoGenerator.generateOpinionNo());
        opinion.setVersion(1);
        opinion.setStatus(OpinionStatus.DRAFT.getCode());
        opinion.setCurrentReviewLevel(0);
        opinion.setCreatedBy(createdBy);
        return opinionRepository.save(opinion);
    }

    @Override
    @Transactional
    public Opinion submitToReview(Long opinionId, Long appraiserId) {
        Opinion opinion = opinionRepository.findById(opinionId)
                .orElseThrow(() -> new IllegalArgumentException("意见书不存在"));

        if (!OpinionStatus.DRAFT.getCode().equals(opinion.getStatus())
                && !OpinionStatus.REJECTED.getCode().equals(opinion.getStatus())) {
            throw new IllegalStateException("当前状态不允许提交复核");
        }

        SysUser appraiser = sysUserRepository.findById(appraiserId)
                .orElseThrow(() -> new IllegalArgumentException("鉴定人不存在"));

        if (!UserRole.APPRAISER.getCode().equals(appraiser.getRole())) {
            throw new IllegalArgumentException("用户不是鉴定人角色");
        }

        opinion.setAppraiser1Id(appraiserId);
        String signature = Pkcs7Util.generateSignature(
                opinion.getTitle() + opinion.getConclusion(),
                appraiser.getPassword()
        );
        opinion.setAppraiser1Signature(signature);

        String verifyCode = UUID.randomUUID().toString().replace("-", "");
        opinion.setVerifyCode(verifyCode);

        String qrCodeFilePath = generateQrCode(opinionId, verifyCode);
        opinion.setQrCodePath(qrCodeFilePath);

        opinion.setStatus(OpinionStatus.REVIEW1.getCode());
        opinion.setCurrentReviewLevel(1);

        return opinionRepository.save(opinion);
    }

    @Override
    public Opinion getOpinionDetail(Long id) {
        return opinionRepository.findById(id).orElse(null);
    }

    @Override
    public List<Opinion> findAll() {
        return opinionRepository.findAll();
    }

    @Override
    public List<Opinion> findByStatus(String status) {
        return opinionRepository.findByStatus(status);
    }

    @Override
    public List<Opinion> findByEntrustmentId(Long entrustmentId) {
        return opinionRepository.findByEntrustmentId(entrustmentId);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        opinionRepository.deleteById(id);
    }

    private String generateQrCode(Long opinionId, String verifyCode) {
        try {
            File dir = new File(qrCodePath);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String content = "opinionId=" + opinionId + "&verifyCode=" + verifyCode;
            byte[] qrCodeBytes = QrCodeUtil.generateQrCode(content, 300, 300);

            String fileName = "opinion_" + opinionId + "_" + System.currentTimeMillis() + ".png";
            String filePath = qrCodePath + File.separator + fileName;

            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                fos.write(qrCodeBytes);
            }

            return filePath;
        } catch (IOException e) {
            throw new RuntimeException("生成二维码失败", e);
        } catch (Exception e) {
            throw new RuntimeException("生成二维码失败", e);
        }
    }
}
