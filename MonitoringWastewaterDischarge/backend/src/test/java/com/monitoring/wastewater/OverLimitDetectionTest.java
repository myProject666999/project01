package com.monitoring.wastewater;

import com.monitoring.wastewater.dto.MonitorDataDTO;
import com.monitoring.wastewater.entity.MonitorData;
import com.monitoring.wastewater.service.MonitorDataService;
import com.monitoring.wastewater.service.OverLimitDetectionService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@SpringBootTest
public class OverLimitDetectionTest {

    @Resource
    private MonitorDataService monitorDataService;

    @Resource
    private OverLimitDetectionService overLimitDetectionService;

    @Test
    public void testNormalData() {
        MonitorDataDTO dto = new MonitorDataDTO();
        dto.setPointId(1L);
        dto.setPointCode("DP001");
        dto.setCodValue(new BigDecimal("300.00"));
        dto.setPhValue(new BigDecimal("7.50"));
        dto.setColorValue(new BigDecimal("50.00"));
        dto.setAmmoniaValue(new BigDecimal("20.00"));
        dto.setMonitorTime(LocalDateTime.now());

        MonitorData result = monitorDataService.saveMonitorData(dto);
        System.out.println("正常数据 - 是否超标: " + result.getIsOverLimit());
    }

    @Test
    public void testOverLimitData() {
        MonitorDataDTO dto = new MonitorDataDTO();
        dto.setPointId(1L);
        dto.setPointCode("DP001");
        dto.setCodValue(new BigDecimal("600.00"));
        dto.setPhValue(new BigDecimal("7.50"));
        dto.setColorValue(new BigDecimal("50.00"));
        dto.setAmmoniaValue(new BigDecimal("20.00"));
        dto.setMonitorTime(LocalDateTime.now());

        MonitorData result = monitorDataService.saveMonitorData(dto);
        System.out.println("超标数据 - 是否超标: " + result.getIsOverLimit());
        System.out.println("超标指标: " + result.getOverLimitIndicators());

        overLimitDetectionService.processMonitorData(result);
        System.out.println("超标检测处理完成");
    }

    @Test
    public void testContinuousOverLimitMinutes() {
        int minutes = monitorDataService.getContinuousOverLimitMinutes("DP001", "COD");
        System.out.println("COD连续超标分钟数: " + minutes);
    }
}
