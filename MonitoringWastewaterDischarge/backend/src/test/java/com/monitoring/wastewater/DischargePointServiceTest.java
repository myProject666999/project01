package com.monitoring.wastewater;

import com.monitoring.wastewater.entity.DischargePoint;
import com.monitoring.wastewater.service.DischargePointService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import javax.annotation.Resource;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class DischargePointServiceTest {

    @Resource
    private DischargePointService dischargePointService;

    @Test
    public void testGetAllPoints() {
        List<DischargePoint> points = dischargePointService.getAllPoints();
        assertNotNull(points);
        assertTrue(points.size() > 0);
        System.out.println("排放点数量: " + points.size());
        for (DischargePoint p : points) {
            System.out.println(p.getPointCode() + " - " + p.getPointName());
        }
    }

    @Test
    public void testGetActivePoints() {
        List<DischargePoint> points = dischargePointService.getActivePoints();
        assertNotNull(points);
        System.out.println("运行中排放点数量: " + points.size());
    }

    @Test
    public void testGetByCode() {
        DischargePoint point = dischargePointService.getByCode("DP001");
        assertNotNull(point);
        assertEquals("DP001", point.getPointCode());
        System.out.println("查询到排放点: " + point.getPointName());
    }
}
