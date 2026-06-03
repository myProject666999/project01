package com.judicial.appraisal.service;

import com.judicial.appraisal.entity.ReviewRecord;

import java.util.List;

public interface ReviewService {

    ReviewRecord reviewOpinion(Long opinionId, Integer reviewLevel, Long reviewerId,
                                String result, Integer rejectTargetLevel, String reviewOpinion);

    List<ReviewRecord> getReviewHistory(Long opinionId);

    List<ReviewRecord> findAll();

    List<ReviewRecord> findByReviewerId(Long reviewerId);
}
