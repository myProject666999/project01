package com.monitoring.wastewater.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.monitoring.wastewater.common.Result;
import com.monitoring.wastewater.dto.RecoveryApplicationDTO;
import com.monitoring.wastewater.dto.RecoveryApprovalDTO;
import com.monitoring.wastewater.entity.RecoveryApplication;
import com.monitoring.wastewater.service.RecoveryApplicationService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("/recovery-application")
public class RecoveryApplicationController {

    @Resource
    private RecoveryApplicationService recoveryApplicationService;

    @GetMapping("/list")
    public Result<Page<RecoveryApplication>> getApplicationList(
            @RequestParam(required = false) Long pointId,
            @RequestParam(required = false) Integer applicationStatus,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return Result.success(recoveryApplicationService.getApplicationList(
                pointId, applicationStatus, pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public Result<RecoveryApplication> getById(@PathVariable Long id) {
        return Result.success(recoveryApplicationService.getById(id));
    }

    @PostMapping
    public Result<RecoveryApplication> createApplication(@RequestBody RecoveryApplicationDTO dto) {
        RecoveryApplication application = recoveryApplicationService.createApplication(dto);
        if (application == null) {
            return Result.error("创建申请失败，停机指令不存在或状态不正确");
        }
        return Result.success(application);
    }

    @PostMapping("/approve")
    public Result<Boolean> approveApplication(@RequestBody RecoveryApprovalDTO dto) {
        return Result.success(recoveryApplicationService.approveApplication(dto));
    }

    @GetMapping("/pending-count")
    public Result<Long> getPendingApprovalCount() {
        return Result.success(recoveryApplicationService.getPendingApprovalCount());
    }
}
