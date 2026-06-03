package com.monitoring.wastewater.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.monitoring.wastewater.common.Result;
import com.monitoring.wastewater.dto.MonitorDataDTO;
import com.monitoring.wastewater.entity.MonitorData;
import com.monitoring.wastewater.service.MonitorDataService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/monitor-data")
public class MonitorDataController {

    @Resource
    private MonitorDataService monitorDataService;

    @PostMapping
    public Result<MonitorData> add(@RequestBody MonitorDataDTO dto) {
        return Result.success(monitorDataService.saveMonitorData(dto));
    }

    @GetMapping("/realtime/{pointCode}")
    public Result<MonitorData> getRealtimeData(@PathVariable String pointCode) {
        return Result.success(monitorDataService.getRealtimeData(pointCode));
    }

    @GetMapping("/recent/{pointCode}/{minutes}")
    public Result<List<MonitorData>> getRecentData(@PathVariable String pointCode,
                                                   @PathVariable int minutes) {
        return Result.success(monitorDataService.getRecentData(pointCode, minutes));
    }

    @GetMapping("/history")
    public Result<Page<MonitorData>> getHistoryData(
            @RequestParam(required = false) Long pointId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return Result.success(monitorDataService.getHistoryData(
                pointId, startTime, endTime, pageNum, pageSize));
    }

    @GetMapping("/continuous/{pointCode}/{indicator}")
    public Result<Integer> getContinuousOverLimitMinutes(@PathVariable String pointCode,
                                                         @PathVariable String indicator) {
        return Result.success(monitorDataService.getContinuousOverLimitMinutes(pointCode, indicator));
    }
}
