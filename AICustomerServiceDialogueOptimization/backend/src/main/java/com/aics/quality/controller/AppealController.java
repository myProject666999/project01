package com.aics.quality.controller;

import com.aics.quality.common.PageQuery;
import com.aics.quality.common.PageResult;
import com.aics.quality.common.Result;
import com.aics.quality.entity.Appeal;
import com.aics.quality.service.AppealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/appeal")
public class AppealController {

    @Autowired
    private AppealService appealService;

    @GetMapping("/list")
    public Result<PageResult<Appeal>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        PageQuery pageQuery = new PageQuery();
        pageQuery.setPageNum(pageNum);
        pageQuery.setPageSize(pageSize);
        return Result.success(appealService.list(pageQuery, keyword, status));
    }

    @GetMapping("/{id}")
    public Result<Appeal> getById(@PathVariable Long id) {
        return Result.success(appealService.getById(id));
    }

    @PostMapping("/submit")
    public Result<Appeal> submit(@RequestBody Appeal appeal) {
        return Result.success(appealService.submit(appeal));
    }

    @PostMapping("/{id}/audit")
    public Result<Boolean> audit(
            @PathVariable Long id,
            @RequestParam Integer status,
            @RequestParam String auditOpinion,
            @RequestParam Long auditorId,
            @RequestParam String auditorName) {
        return Result.success(appealService.audit(id, status, auditOpinion, auditorId, auditorName));
    }
}
