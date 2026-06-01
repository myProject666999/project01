package com.aics.quality.controller;

import com.aics.quality.common.PageQuery;
import com.aics.quality.common.PageResult;
import com.aics.quality.common.Result;
import com.aics.quality.entity.QualityTask;
import com.aics.quality.service.QualityTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/quality-task")
public class QualityTaskController {

    @Autowired
    private QualityTaskService qualityTaskService;

    @GetMapping("/list")
    public Result<PageResult<QualityTask>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        PageQuery pageQuery = new PageQuery();
        pageQuery.setPageNum(pageNum);
        pageQuery.setPageSize(pageSize);
        return Result.success(qualityTaskService.list(pageQuery, keyword, status));
    }

    @GetMapping("/{id}")
    public Result<QualityTask> getById(@PathVariable Long id) {
        return Result.success(qualityTaskService.getById(id));
    }

    @PostMapping
    public Result<QualityTask> create(@RequestBody QualityTask task) {
        QualityTask created = qualityTaskService.create(task);
        qualityTaskService.executeTask(created.getId());
        return Result.success(created);
    }

    @PostMapping("/{id}/execute")
    public Result<Void> execute(@PathVariable Long id) {
        qualityTaskService.executeTask(id);
        return Result.success();
    }
}
