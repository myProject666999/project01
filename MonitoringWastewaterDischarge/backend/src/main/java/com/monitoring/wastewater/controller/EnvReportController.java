package com.monitoring.wastewater.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.monitoring.wastewater.common.Result;
import com.monitoring.wastewater.entity.EnvReportRecord;
import com.monitoring.wastewater.service.EnvReportService;
import com.monitoring.wastewater.task.DataSimulationTask;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("/env-report")
public class EnvReportController {

    @Resource
    private EnvReportService envReportService;

    @Resource
    private DataSimulationTask dataSimulationTask;

    @GetMapping("/list")
    public Result<Page<EnvReportRecord>> getReportList(
            @RequestParam(required = false) Long pointId,
            @RequestParam(required = false) Integer reportStatus,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return Result.success(envReportService.getReportList(
                pointId, reportStatus, pageNum, pageSize));
    }

    @PostMapping("/retry")
    public Result<String> retryFailedReports() {
        envReportService.retryFailedReports();
        return Result.success("已触发重发操作");
    }

    @PostMapping("/trigger-overlimit/{pointCode}/{indicator}")
    public Result<String> triggerOverLimit(@PathVariable String pointCode,
                                           @PathVariable String indicator) {
        dataSimulationTask.triggerOverLimit(pointCode, indicator);
        return Result.success("已设置强制超标，将在下一次数据模拟时生效");
    }
}
