package com.monitoring.wastewater.controller;

import com.monitoring.wastewater.common.Result;
import com.monitoring.wastewater.entity.DischargePoint;
import com.monitoring.wastewater.entity.MonitorData;
import com.monitoring.wastewater.service.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Resource
    private DischargePointService dischargePointService;

    @Resource
    private MonitorDataService monitorDataService;

    @Resource
    private AlarmRecordService alarmRecordService;

    @Resource
    private ShutdownOrderService shutdownOrderService;

    @Resource
    private RecoveryApplicationService recoveryApplicationService;

    @GetMapping("/stats")
    public Result<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();

        List<DischargePoint> points = dischargePointService.getAllPoints();
        stats.put("totalPoints", points.size());
        stats.put("runningPoints", points.stream().filter(p -> p.getStatus() == 1).count());
        stats.put("stoppedPoints", points.stream().filter(p -> p.getStatus() == 0).count());

        stats.put("alarmCount24h", alarmRecordService.getUnprocessedAlarmCount());
        stats.put("pendingShutdownOrders", shutdownOrderService.getPendingOrderCount());
        stats.put("pendingRecoveryApplications", recoveryApplicationService.getPendingApprovalCount());

        return Result.success(stats);
    }

    @GetMapping("/realtime-all")
    public Result<Map<String, MonitorData>> getRealtimeAllData() {
        Map<String, MonitorData> result = new HashMap<>();
        List<DischargePoint> points = dischargePointService.getAllPoints();
        for (DischargePoint point : points) {
            MonitorData data = monitorDataService.getRealtimeData(point.getPointCode());
            result.put(point.getPointCode(), data);
        }
        return Result.success(result);
    }
}
