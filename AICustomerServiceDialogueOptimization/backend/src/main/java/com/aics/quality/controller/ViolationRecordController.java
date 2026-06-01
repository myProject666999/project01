package com.aics.quality.controller;

import com.aics.quality.common.PageQuery;
import com.aics.quality.common.PageResult;
import com.aics.quality.common.Result;
import com.aics.quality.entity.ViolationRecord;
import com.aics.quality.service.ViolationRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/violation")
public class ViolationRecordController {

    @Autowired
    private ViolationRecordService violationRecordService;

    @GetMapping("/list")
    public Result<PageResult<ViolationRecord>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer violationLevel) {
        PageQuery pageQuery = new PageQuery();
        pageQuery.setPageNum(pageNum);
        pageQuery.setPageSize(pageSize);
        return Result.success(violationRecordService.list(pageQuery, keyword, status, violationLevel));
    }

    @GetMapping("/{id}")
    public Result<ViolationRecord> getById(@PathVariable Long id) {
        return Result.success(violationRecordService.getById(id));
    }

    @PostMapping("/{id}/confirm")
    public Result<Boolean> confirm(@PathVariable Long id, @RequestParam String confirmBy) {
        return Result.success(violationRecordService.confirm(id, confirmBy));
    }

    @PostMapping("/{id}/revoke")
    public Result<Boolean> revoke(@PathVariable Long id) {
        return Result.success(violationRecordService.revoke(id));
    }
}
