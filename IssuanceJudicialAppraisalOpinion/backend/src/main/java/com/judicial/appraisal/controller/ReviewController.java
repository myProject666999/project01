package com.judicial.appraisal.controller;

import com.judicial.appraisal.common.Result;
import com.judicial.appraisal.common.enums.ReviewResult;
import com.judicial.appraisal.entity.ReviewRecord;
import com.judicial.appraisal.service.ReviewService;
import com.judicial.appraisal.util.SecurityUtil;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping
    public Result<List<ReviewRecord>> list(@RequestParam(required = false) Long opinionId) {
        List<ReviewRecord> records;
        if (opinionId != null) {
            records = reviewService.getReviewHistory(opinionId);
        } else {
            records = reviewService.findAll();
        }
        return Result.success(records);
    }

    @GetMapping("/my")
    public Result<List<ReviewRecord>> getMyReviews() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        if (currentUserId == null) {
            return Result.error("用户未登录");
        }
        List<ReviewRecord> records = reviewService.findByReviewerId(currentUserId);
        return Result.success(records);
    }

    @GetMapping("/opinion/{opinionId}")
    public Result<List<ReviewRecord>> getReviewHistory(@PathVariable Long opinionId) {
        List<ReviewRecord> records = reviewService.getReviewHistory(opinionId);
        return Result.success(records);
    }

    @PostMapping("/review")
    public Result<ReviewRecord> review(@RequestBody ReviewRequest request) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        if (currentUserId == null) {
            return Result.error("用户未登录");
        }

        if (request.getOpinionId() == null) {
            return Result.error("opinionId 不能为空");
        }
        if (request.getReviewLevel() == null) {
            return Result.error("reviewLevel 不能为空");
        }
        if (request.getResult() == null) {
            return Result.error("result 不能为空");
        }
        if (request.getReviewOpinion() == null || request.getReviewOpinion().trim().isEmpty()) {
            return Result.error("reviewOpinion 不能为空");
        }

        String resultCode = request.getResult();
        if (!ReviewResult.PASS.getCode().equals(resultCode) && !ReviewResult.REJECT.getCode().equals(resultCode)) {
            return Result.error("result 必须是 PASS 或 REJECT");
        }

        if (ReviewResult.REJECT.getCode().equals(resultCode)) {
            if (request.getRejectTargetLevel() == null) {
                return Result.error("驳回时 rejectTargetLevel 不能为空");
            }
            if (request.getRejectTargetLevel() < 0 || request.getRejectTargetLevel() > 2) {
                return Result.error("rejectTargetLevel 必须是 0、1 或 2");
            }
        }

        try {
            ReviewRecord record = reviewService.reviewOpinion(
                    request.getOpinionId(),
                    request.getReviewLevel(),
                    currentUserId,
                    resultCode,
                    request.getRejectTargetLevel(),
                    request.getReviewOpinion()
            );
            return Result.success(record);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return Result.error(e.getMessage());
        }
    }

    @Data
    public static class ReviewRequest {
        private Long opinionId;
        private Integer reviewLevel;
        private String result;
        private Integer rejectTargetLevel;
        private String reviewOpinion;
    }
}
