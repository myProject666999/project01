package com.judicial.appraisal.service.impl;

import com.judicial.appraisal.common.enums.TaskStatus;
import com.judicial.appraisal.entity.AppraisalTask;
import com.judicial.appraisal.entity.SysUser;
import com.judicial.appraisal.repository.AppraisalTaskRepository;
import com.judicial.appraisal.repository.SysUserRepository;
import com.judicial.appraisal.service.AppraisalTaskService;
import com.judicial.appraisal.util.NoGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppraisalTaskServiceImpl implements AppraisalTaskService {

    @Autowired
    private AppraisalTaskRepository appraisalTaskRepository;

    @Autowired
    private SysUserRepository sysUserRepository;

    @Override
    @Transactional
    public AppraisalTask assignTask(Long entrustmentId, Long evidenceId, Long appraiserId,
                                    Long assistantId, String description, Long createdBy) {
        SysUser appraiser = sysUserRepository.findById(appraiserId)
                .orElseThrow(() -> new IllegalArgumentException("鉴定人不存在，ID: " + appraiserId));

        if (createdBy == null) {
            throw new IllegalArgumentException("创建人ID不能为空");
        }

        AppraisalTask task = new AppraisalTask();
        task.setTaskNo(NoGenerator.generateTaskNo());
        task.setEntrustmentId(entrustmentId);
        task.setEvidenceId(evidenceId);
        task.setAppraiserId(appraiserId);
        task.setAssistantId(assistantId);
        task.setTaskDescription(description);
        task.setStatus(TaskStatus.ASSIGNED.getCode());
        task.setAssignTime(LocalDateTime.now());
        task.setCreatedBy(createdBy);

        return appraisalTaskRepository.save(task);
    }

    @Override
    @Transactional
    public AppraisalTask startTask(Long taskId, Long appraiserId) {
        AppraisalTask task = appraisalTaskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("鉴定任务不存在，ID: " + taskId));

        if (!task.getAppraiserId().equals(appraiserId)) {
            throw new IllegalArgumentException("只有指定的鉴定人才能启动该任务");
        }

        String currentStatus = task.getStatus();
        if (!TaskStatus.ASSIGNED.getCode().equals(currentStatus)) {
            throw new IllegalStateException("任务当前状态不是已分配，无法启动");
        }

        task.setStatus(TaskStatus.IN_PROGRESS.getCode());
        task.setStartTime(LocalDateTime.now());

        return appraisalTaskRepository.save(task);
    }

    @Override
    @Transactional
    public AppraisalTask completeTask(Long taskId, Long appraiserId) {
        AppraisalTask task = appraisalTaskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("鉴定任务不存在，ID: " + taskId));

        if (!task.getAppraiserId().equals(appraiserId)) {
            throw new IllegalArgumentException("只有指定的鉴定人才能完成该任务");
        }

        String currentStatus = task.getStatus();
        if (!TaskStatus.IN_PROGRESS.getCode().equals(currentStatus)) {
            throw new IllegalStateException("任务当前状态不是进行中，无法完成");
        }

        task.setStatus(TaskStatus.COMPLETED.getCode());
        task.setCompleteTime(LocalDateTime.now());

        return appraisalTaskRepository.save(task);
    }

    @Override
    public List<AppraisalTask> findByAppraiserId(Long appraiserId) {
        return appraisalTaskRepository.findByAppraiserId(appraiserId);
    }

    @Override
    public List<AppraisalTask> findAll() {
        return appraisalTaskRepository.findAll();
    }

    @Override
    public AppraisalTask findById(Long id) {
        return appraisalTaskRepository.findById(id).orElse(null);
    }

    @Override
    public List<AppraisalTask> findByStatus(String status) {
        return appraisalTaskRepository.findByStatus(status);
    }

    @Override
    public List<AppraisalTask> findByAppraiserIdAndStatus(Long appraiserId, String status) {
        return appraisalTaskRepository.findByAppraiserIdAndStatus(appraiserId, status);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        appraisalTaskRepository.deleteById(id);
    }
}
