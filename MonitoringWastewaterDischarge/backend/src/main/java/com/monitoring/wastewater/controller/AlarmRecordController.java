package com.monitoring.wastewater.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.monitoring.wastewater.common.Result;
import com.monitoring.wastewater.entity.AlarmRecord;
import com.monitoring.wastewater.service.AlarmRecordService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/alarm-record")
public class AlarmRecordController {

    @Resource
    private AlarmRecordService alarmRecordService;

    @GetMapping("/list")
    public Result<Page<AlarmRecord>> getAlarmList(
            @RequestParam(required = false) Long pointId,
            @RequestParam(required = false) Integer alarmLevel,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return Result.success(alarmRecordService.getAlarmList(
                pointId, alarmLevel, startTime, endTime, pageNum, pageSize));
    }

    @GetMapping("/unprocessed-count")
    public Result<Long> getUnprocessedAlarmCount() {
        return Result.success(alarmRecordService.getUnprocessedAlarmCount());
    }
}
