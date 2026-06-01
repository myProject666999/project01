package com.judicial.appraisal.controller;

import com.judicial.appraisal.common.Result;
import com.judicial.appraisal.entity.Entrustment;
import com.judicial.appraisal.service.EntrustmentService;
import com.judicial.appraisal.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/entrustments")
public class EntrustmentController {

    @Autowired
    private EntrustmentService entrustmentService;

    @GetMapping
    public Result<List<Entrustment>> getEntrustments(@RequestParam(required = false) String status) {
        List<Entrustment> entrustments;
        if (status != null && !status.isEmpty()) {
            entrustments = entrustmentService.findByStatus(status);
        } else {
            entrustments = entrustmentService.findAll();
        }
        return Result.success(entrustments);
    }

    @GetMapping("/{id}")
    public Result<Entrustment> getEntrustmentById(@PathVariable Long id) {
        return Result.success(entrustmentService.findById(id));
    }

    @PostMapping
    public Result<Entrustment> createEntrustment(@Valid @RequestBody Entrustment entrustment) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error("用户未登录");
        }
        return Result.success(entrustmentService.register(entrustment, userId));
    }

    @PutMapping("/{id}")
    public Result<Entrustment> updateEntrustment(@PathVariable Long id, @Valid @RequestBody Entrustment entrustment) {
        entrustment.setId(id);
        return Result.success(entrustmentService.save(entrustment));
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        if (status == null || status.isEmpty()) {
            return Result.error("状态不能为空");
        }
        entrustmentService.updateStatus(id, status);
        return Result.success();
    }
}
