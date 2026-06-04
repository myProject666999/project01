package com.judicial.appraisal.controller;

import com.judicial.appraisal.common.Result;
import com.judicial.appraisal.entity.AppraisalTask;
import com.judicial.appraisal.service.AppraisalTaskService;
import com.judicial.appraisal.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class AppraisalTaskController {

    @Autowired
    private AppraisalTaskService appraisalTaskService;

    @GetMapping
    public Result<List<AppraisalTask>> getList(
            @RequestParam(required = false) Long appraiserId,
            @RequestParam(required = false) String status) {
        List<AppraisalTask> list;
        if (appraiserId != null && status != null) {
            list = appraisalTaskService.findByAppraiserIdAndStatus(appraiserId, status);
        } else if (appraiserId != null) {
            list = appraisalTaskService.findByAppraiserId(appraiserId);
        } else if (status != null) {
            list = appraisalTaskService.findByStatus(status);
        } else {
            list = appraisalTaskService.findAll();
        }
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<AppraisalTask> getDetail(@PathVariable Long id) {
        AppraisalTask task = appraisalTaskService.findById(id);
        if (task == null) {
            return Result.error("鉴定任务不存在");
        }
        return Result.success(task);
    }

    @PostMapping("/assign")
    public Result<AppraisalTask> assignTask(@RequestBody Map<String, Object> request) {
        Long entrustmentId = request.get("entrustmentId") != null ? Long.valueOf(request.get("entrustmentId").toString()) : null;
        Long evidenceId = request.get("evidenceId") != null ? Long.valueOf(request.get("evidenceId").toString()) : null;
        Long appraiserId = request.get("appraiserId") != null ? Long.valueOf(request.get("appraiserId").toString()) : null;
        Long assistantId = request.get("assistantId") != null ? Long.valueOf(request.get("assistantId").toString()) : null;
        String description = request.get("description") != null ? request.get("description").toString() : null;
        Long createdBy = SecurityUtil.getCurrentUserId();

        if (entrustmentId == null || evidenceId == null || appraiserId == null) {
            return Result.error("委托书ID、检材ID、鉴定人ID不能为空");
        }
        if (createdBy == null) {
            return Result.error("用户未登录");
        }

        AppraisalTask task = appraisalTaskService.assignTask(entrustmentId, evidenceId, appraiserId, assistantId, description, createdBy);
        return Result.success(task);
    }

    @PutMapping("/{id}/start")
    public Result<AppraisalTask> startTask(@PathVariable Long id) {
        Long appraiserId = SecurityUtil.getCurrentUserId();
        if (appraiserId == null) {
            return Result.error("用户未登录");
        }
        AppraisalTask task = appraisalTaskService.startTask(id, appraiserId);
        return Result.success(task);
    }

    @PutMapping("/{id}/complete")
    public Result<AppraisalTask> completeTask(@PathVariable Long id) {
        Long appraiserId = SecurityUtil.getCurrentUserId();
        if (appraiserId == null) {
            return Result.error("用户未登录");
        }
        AppraisalTask task = appraisalTaskService.completeTask(id, appraiserId);
        return Result.success(task);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteById(@PathVariable Long id) {
        appraisalTaskService.deleteById(id);
        return Result.success();
    }
}
