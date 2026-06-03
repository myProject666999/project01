package com.monitoring.wastewater;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.monitoring.wastewater.dto.MonitorDataDTO;
import com.monitoring.wastewater.entity.MonitorData;
import com.monitoring.wastewater.service.MonitorDataService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class MonitorDataServiceTest {

    @Resource
    private MonitorDataService monitorDataService;

    @Test
    public void testSaveMonitorData() {
        MonitorDataDTO dto = new MonitorDataDTO();
        dto.setPointId(1L);
        dto.setPointCode("DP001");
        dto.setCodValue(new BigDecimal("350.00"));
        dto.setPhValue(new BigDecimal("7.50"));
        dto.setColorValue(new BigDecimal("50.00"));
        dto.setAmmoniaValue(new BigDecimal("25.00"));
        dto.setMonitorTime(LocalDateTime.now());

        MonitorData result = monitorDataService.saveMonitorData(dto);
        assertNotNull(result);
        assertNotNull(result.getId());
        System.out.println("保存监测数据成功，ID: " + result.getId());
    }

    @Test
    public void testGetHistoryData() {
        Page<MonitorData> page = monitorDataService.getHistoryData(null, null, null, 1, 10);
        assertNotNull(page);
        System.out.println("总记录数: " + page.getTotal());
        System.out.println("当前页记录数: " + page.getRecords().size());
    }

    @Test
    public void testGetRecentData() {
        List<MonitorData> data = monitorDataService.getRecentData("DP001", 10);
        assertNotNull(data);
        System.out.println("最近10条数据数量: " + data.size());
    }
}
