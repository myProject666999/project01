package com.judicial.appraisal.service;

import com.judicial.appraisal.entity.Opinion;

import java.util.List;

public interface OpinionService {

    Opinion createDraft(Opinion opinion, Long createdBy);

    Opinion submitToReview(Long opinionId, Long appraiserId);

    Opinion getOpinionDetail(Long id);

    List<Opinion> findAll();

    List<Opinion> findByStatus(String status);

    List<Opinion> findByEntrustmentId(Long entrustmentId);
}
