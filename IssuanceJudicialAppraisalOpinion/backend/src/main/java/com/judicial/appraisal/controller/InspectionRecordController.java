package com.judicial.appraisal.controller;

import com.judicial.appraisal.common.Result;
import com.judicial.appraisal.entity.InspectionRecord;
import com.judicial.appraisal.service.InspectionRecordService;
import com.judicial.appraisal.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inspection-records")
public class InspectionRecordController {

    @Autowired
    private InspectionRecordService inspectionRecordService;

    @GetMapping
    public Result<List<InspectionRecord>> list(
            @RequestParam(required = false) Long taskId,
            @RequestParam(required = false) Long evidenceId) {
        List<InspectionRecord> records;
        if (taskId != null) {
            records = inspectionRecordService.findByTaskId(taskId);
        } else if (evidenceId != null) {
            records = inspectionRecordService.findByEvidenceId(evidenceId);
        } else {
            records = inspectionRecordService.findAll();
        }
        return Result.success(records);
    }

    @GetMapping("/{id}")
    public Result<InspectionRecord> getById(@PathVariable Long id) {
        InspectionRecord record = inspectionRecordService.findById(id);
        if (record == null) {
            return Result.error("检验记录不存在");
        }
        return Result.success(record);
    }

    @PostMapping
    public Result<InspectionRecord> create(@RequestBody InspectionRecord record) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        if (currentUserId == null) {
            return Result.error("用户未登录");
        }
        try {
            InspectionRecord created = inspectionRecordService.createRecord(record, currentUserId);
            return Result.success(created);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteById(@PathVariable Long id) {
        inspectionRecordService.deleteById(id);
        return Result.success();
    }
}
