package com.monitoring.wastewater.task;

import com.monitoring.wastewater.dto.MonitorDataDTO;
import com.monitoring.wastewater.entity.DischargePoint;
import com.monitoring.wastewater.entity.MonitorData;
import com.monitoring.wastewater.service.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class DataSimulationTask {

    @Value("${monitoring.data-simulation.enabled:true}")
    private boolean simulationEnabled;

    @Resource
    private DischargePointService dischargePointService;

    @Resource
    private MonitorDataService monitorDataService;

    @Resource
    private OverLimitDetectionService overLimitDetectionService;

    @Resource
    private EnvReportService envReportService;

    @Resource
    private RedisTemplate<String, Object> redisTemplate;

    private final Random random = new Random();

    @Scheduled(cron = "0 * * * * ?")
    public void generateMonitorData() {
        if (!simulationEnabled) {
            return;
        }

        List<DischargePoint> points = dischargePointService.getActivePoints();
        if (points == null || points.isEmpty()) {
            log.warn("没有可用的排放点，跳过数据模拟");
            return;
        }

        LocalDateTime monitorTime = LocalDateTime.now();
        log.info("开始生成模拟监测数据，时间: {}, 排放点数量: {}", monitorTime, points.size());

        for (DischargePoint point : points) {
            try {
                String forceOverLimitKey = "monitor:force_over_limit:" + point.getPointCode();
                String forceIndicator = (String) redisTemplate.opsForValue().get(forceOverLimitKey);

                MonitorDataDTO dto = generatePointData(point, monitorTime, forceIndicator);
                MonitorData savedData = monitorDataService.saveMonitorData(dto);

                overLimitDetectionService.processMonitorData(savedData);

                envReportService.reportMonitorData(savedData);

                if (forceIndicator != null) {
                    redisTemplate.delete(forceOverLimitKey);
                }

                log.debug("排放点 {} 生成数据完成: COD={}, pH={}, 色度={}, 氨氮={}, 是否超标={}",
                        point.getPointCode(), dto.getCodValue(), dto.getPhValue(),
                        dto.getColorValue(), dto.getAmmoniaValue(), savedData.getIsOverLimit());

            } catch (Exception e) {
                log.error("生成排放点 {} 数据异常", point.getPointCode(), e);
            }
        }

        log.info("模拟监测数据生成完成");
    }

    private MonitorDataDTO generatePointData(DischargePoint point, LocalDateTime monitorTime,
                                             String forceOverLimitIndicator) {
        MonitorDataDTO dto = new MonitorDataDTO();
        dto.setPointId(point.getId());
        dto.setPointCode(point.getPointCode());
        dto.setMonitorTime(monitorTime);

        boolean forceOverLimit = forceOverLimitIndicator != null;

        BigDecimal codValue = generateValue(point.getCodThreshold(), 0.6, 0.8,
                "COD".equals(forceOverLimitIndicator));
        dto.setCodValue(codValue);

        BigDecimal phValue = generatePhValue(point.getPhMinThreshold(),
                point.getPhMaxThreshold(), "pH".equals(forceOverLimitIndicator));
        dto.setPhValue(phValue);

        BigDecimal colorValue = generateValue(point.getColorThreshold(), 0.5, 0.7,
                "COLOR".equals(forceOverLimitIndicator));
        dto.setColorValue(colorValue);

        BigDecimal ammoniaValue = generateValue(point.getAmmoniaThreshold(), 0.5, 0.7,
                "AMMONIA".equals(forceOverLimitIndicator));
        dto.setAmmoniaValue(ammoniaValue);

        return dto;
    }

    private BigDecimal generateValue(BigDecimal threshold, double normalRatio,
                                     double overLimitProbability, boolean forceOverLimit) {
        BigDecimal baseValue = threshold.multiply(BigDecimal.valueOf(normalRatio));
        BigDecimal variance = threshold.multiply(BigDecimal.valueOf(0.15));

        double value = baseValue.doubleValue() + (random.nextDouble() - 0.5)
                * variance.doubleValue() * 2;

        if (forceOverLimit || random.nextDouble() < 0.05) {
            value = threshold.doubleValue() * (1.1 + random.nextDouble() * 0.5);
        }

        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal generatePhValue(BigDecimal minThreshold, BigDecimal maxThreshold,
                                       boolean forceOverLimit) {
        double normalMin = minThreshold.doubleValue() + 0.5;
        double normalMax = maxThreshold.doubleValue() - 0.5;
        double value = normalMin + random.nextDouble() * (normalMax - normalMin);

        if (forceOverLimit || random.nextDouble() < 0.03) {
            if (random.nextBoolean()) {
                value = minThreshold.doubleValue() - (0.5 + random.nextDouble() * 1.5);
            } else {
                value = maxThreshold.doubleValue() + (0.5 + random.nextDouble() * 1.5);
            }
        }

        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    public void triggerOverLimit(String pointCode, String indicator) {
        String key = "monitor:force_over_limit:" + pointCode;
        redisTemplate.opsForValue().set(key, indicator, 5, TimeUnit.MINUTES);
        log.info("已设置排放点 {} 强制超标指标: {}", pointCode, indicator);
    }

    @Scheduled(cron = "0 */5 * * * ?")
    public void retryFailedReports() {
        log.info("开始重试报送失败的数据");
        envReportService.retryFailedReports();
        log.info("报送失败数据重试完成");
    }
}
