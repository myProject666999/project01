package com.monitoring.wastewater.service;

import com.monitoring.wastewater.entity.DischargePoint;
import com.monitoring.wastewater.entity.MonitorData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OverLimitDetectionService {

    @Value("${monitoring.over-limit.continuous-minutes:3}")
    private int continuousMinutesThreshold;

    @Resource
    private MonitorDataService monitorDataService;

    @Resource
    private AlarmRecordService alarmRecordService;

    @Resource
    private ShutdownOrderService shutdownOrderService;

    @Resource
    private DischargePointService dischargePointService;

    private static final Map<String, String> INDICATOR_NAME_MAP = new HashMap<>();

    static {
        INDICATOR_NAME_MAP.put("COD", "化学需氧量(COD)");
        INDICATOR_NAME_MAP.put("pH", "pH值");
        INDICATOR_NAME_MAP.put("COLOR", "色度");
        INDICATOR_NAME_MAP.put("AMMONIA", "氨氮");
    }

    public void processMonitorData(MonitorData data) {
        if (data.getIsOverLimit() == 0 || data.getOverLimitIndicators() == null) {
            return;
        }

        DischargePoint point = dischargePointService.getById(data.getPointId());
        if (point == null || point.getStatus() == 0) {
            return;
        }

        List<String> indicators = Arrays.asList(data.getOverLimitIndicators().split(","));
        for (String indicator : indicators) {
            processOverLimitIndicator(data, point, indicator);
        }
    }

    private void processOverLimitIndicator(MonitorData data, DischargePoint point, String indicator) {
        int continuousMinutes = monitorDataService.getContinuousOverLimitMinutes(
                data.getPointCode(), indicator);

        BigDecimal currentValue = getIndicatorValue(data, indicator);
        BigDecimal thresholdValue = getIndicatorThreshold(point, indicator);

        alarmRecordService.createAlarm(data, indicator, currentValue,
                thresholdValue, continuousMinutes);

        if (continuousMinutes >= continuousMinutesThreshold) {
            if (!shutdownOrderService.hasActiveShutdownOrder(data.getPointId(), indicator)) {
                shutdownOrderService.createShutdownOrder(data, indicator,
                        currentValue, thresholdValue, continuousMinutes);
                dischargePointService.updatePointStatus(data.getPointId(), 0);
            }
        }
    }

    private BigDecimal getIndicatorValue(MonitorData data, String indicator) {
        switch (indicator) {
            case "COD":
                return data.getCodValue();
            case "pH":
                return data.getPhValue();
            case "COLOR":
                return data.getColorValue();
            case "AMMONIA":
                return data.getAmmoniaValue();
            default:
                return BigDecimal.ZERO;
        }
    }

    private BigDecimal getIndicatorThreshold(DischargePoint point, String indicator) {
        switch (indicator) {
            case "COD":
                return point.getCodThreshold();
            case "pH":
                return point.getPhMaxThreshold();
            case "COLOR":
                return point.getColorThreshold();
            case "AMMONIA":
                return point.getAmmoniaThreshold();
            default:
                return BigDecimal.ZERO;
        }
    }
}
