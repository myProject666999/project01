package com.judicial.appraisal.service.impl;

import com.judicial.appraisal.common.enums.OpinionStatus;
import com.judicial.appraisal.common.enums.ReviewResult;
import com.judicial.appraisal.common.enums.UserRole;
import com.judicial.appraisal.entity.Opinion;
import com.judicial.appraisal.entity.ReviewRecord;
import com.judicial.appraisal.entity.SysUser;
import com.judicial.appraisal.repository.OpinionRepository;
import com.judicial.appraisal.repository.ReviewRecordRepository;
import com.judicial.appraisal.repository.SysUserRepository;
import com.judicial.appraisal.service.ReviewService;
import com.judicial.appraisal.util.Pkcs7Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRecordRepository reviewRecordRepository;

    @Autowired
    private OpinionRepository opinionRepository;

    @Autowired
    private SysUserRepository sysUserRepository;

    @Override
    @Transactional
    public ReviewRecord reviewOpinion(Long opinionId, Integer reviewLevel, Long reviewerId,
                                       String result, Integer rejectTargetLevel, String reviewOpinion) {
        Opinion opinion = opinionRepository.findById(opinionId)
                .orElseThrow(() -> new IllegalArgumentException("意见书不存在"));

        SysUser reviewer = sysUserRepository.findById(reviewerId)
                .orElseThrow(() -> new IllegalArgumentException("复核人不存在"));

        validateReviewerRole(reviewer, reviewLevel);

        validateOpinionStatus(opinion, reviewLevel);

        if (ReviewResult.REJECT.getCode().equals(result)) {
            if (rejectTargetLevel == null || reviewOpinion == null || reviewOpinion.trim().isEmpty()) {
                throw new IllegalArgumentException("驳回时必须填写rejectTargetLevel和reviewOpinion");
            }
            if (rejectTargetLevel >= reviewLevel) {
                throw new IllegalArgumentException("驳回目标级别必须小于当前复核级别");
            }
        }

        String signature = Pkcs7Util.generateSignature(
                opinion.getTitle() + opinion.getConclusion() + result + LocalDateTime.now(),
                reviewer.getPassword()
        );

        ReviewRecord record = new ReviewRecord();
        record.setOpinionId(opinionId);
        record.setReviewLevel(reviewLevel);
        record.setReviewerId(reviewerId);
        record.setReviewerSignature(signature);
        record.setResult(result);
        record.setRejectTargetLevel(rejectTargetLevel);
        record.setOpinion(reviewOpinion);
        record.setReviewTime(LocalDateTime.now());

        updateOpinionStatus(opinion, reviewLevel, result, rejectTargetLevel, reviewerId, signature);

        opinionRepository.save(opinion);
        return reviewRecordRepository.save(record);
    }

    @Override
    public List<ReviewRecord> getReviewHistory(Long opinionId) {
        return reviewRecordRepository.findByOpinionIdOrderByCreatedAtDesc(opinionId);
    }

    private void validateReviewerRole(SysUser reviewer, Integer reviewLevel) {
        String expectedRole = switch (reviewLevel) {
            case 1 -> UserRole.REVIEWER1.getCode();
            case 2 -> UserRole.REVIEWER2.getCode();
            case 3 -> UserRole.REVIEWER3.getCode();
            default -> throw new IllegalArgumentException("无效的复核级别");
        };
        if (!expectedRole.equals(reviewer.getRole())) {
            throw new IllegalArgumentException("复核人角色与级别不匹配");
        }
    }

    private void validateOpinionStatus(Opinion opinion, Integer reviewLevel) {
        String expectedStatus = switch (reviewLevel) {
            case 1 -> OpinionStatus.REVIEW1.getCode();
            case 2 -> OpinionStatus.REVIEW2.getCode();
            case 3 -> OpinionStatus.REVIEW3.getCode();
            default -> throw new IllegalArgumentException("无效的复核级别");
        };
        if (!expectedStatus.equals(opinion.getStatus())) {
            throw new IllegalStateException("意见书状态不匹配当前复核级别");
        }
    }

    private void updateOpinionStatus(Opinion opinion, Integer reviewLevel, String result,
                                      Integer rejectTargetLevel, Long reviewerId, String signature) {
        if (ReviewResult.PASS.getCode().equals(result)) {
            switch (reviewLevel) {
                case 1 -> {
                    opinion.setReviewer1Id(reviewerId);
                    opinion.setReviewer1Signature(signature);
                    opinion.setStatus(OpinionStatus.REVIEW2.getCode());
                    opinion.setCurrentReviewLevel(2);
                }
                case 2 -> {
                    opinion.setReviewer2Id(reviewerId);
                    opinion.setReviewer2Signature(signature);
                    opinion.setStatus(OpinionStatus.REVIEW3.getCode());
                    opinion.setCurrentReviewLevel(3);
                }
                case 3 -> {
                    opinion.setReviewer3Id(reviewerId);
                    opinion.setReviewer3Signature(signature);
                    opinion.setStatus(OpinionStatus.ISSUED.getCode());
                    opinion.setCurrentReviewLevel(4);
                    opinion.setIssueDate(LocalDate.now());
                }
            }
        } else if (ReviewResult.REJECT.getCode().equals(result)) {
            opinion.setStatus(OpinionStatus.REJECTED.getCode());
            if (rejectTargetLevel == 0) {
                opinion.setCurrentReviewLevel(0);
            } else if (rejectTargetLevel == 1) {
                opinion.setCurrentReviewLevel(1);
            } else if (rejectTargetLevel == 2) {
                opinion.setCurrentReviewLevel(2);
            }
        }
    }
}
