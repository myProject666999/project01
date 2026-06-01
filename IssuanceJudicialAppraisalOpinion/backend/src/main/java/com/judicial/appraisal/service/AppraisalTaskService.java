package com.judicial.appraisal.service;

import com.judicial.appraisal.entity.AppraisalTask;

import java.util.List;

public interface AppraisalTaskService {

    AppraisalTask assignTask(Long entrustmentId, Long evidenceId, Long appraiserId,
                             Long assistantId, String description, Long createdBy);

    AppraisalTask startTask(Long taskId, Long appraiserId);

    AppraisalTask completeTask(Long taskId, Long appraiserId);

    List<AppraisalTask> findByAppraiserId(Long appraiserId);

    List<AppraisalTask> findAll();

    AppraisalTask findById(Long id);

    List<AppraisalTask> findByStatus(String status);

    List<AppraisalTask> findByAppraiserIdAndStatus(Long appraiserId, String status);
}
