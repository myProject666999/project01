package com.fishery.fryrelease.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fishery.fryrelease.entity.RecaptureRecord;
import com.fishery.fryrelease.entity.ReleaseRecord;
import com.fishery.fryrelease.entity.WaterQuality;
import com.fishery.fryrelease.mapper.RecaptureRecordMapper;
import com.fishery.fryrelease.mapper.ReleaseRecordMapper;
import com.fishery.fryrelease.mapper.WaterQualityMapper;
import com.fishery.fryrelease.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private ReleaseRecordMapper releaseRecordMapper;

    @Autowired
    private RecaptureRecordMapper recaptureRecordMapper;

    @Autowired
    private WaterQualityMapper waterQualityMapper;

    @Override
    public Map<String, Object> getOverview() {
        Map<String, Object> overview = new HashMap<>();

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);
        LambdaQueryWrapper<ReleaseRecord> todayWrapper = new LambdaQueryWrapper<>();
        todayWrapper.ge(ReleaseRecord::getReleaseTime, todayStart).lt(ReleaseRecord::getReleaseTime, todayEnd);
        List<ReleaseRecord> todayRecords = releaseRecordMapper.selectList(todayWrapper);
        long todayRelease = todayRecords.stream().mapToLong(ReleaseRecord::getActualQuantity).sum();
        overview.put("todayRelease", todayRelease);

        LocalDate firstOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate lastOfMonth = LocalDate.now().plusMonths(1).withDayOfMonth(1);
        LambdaQueryWrapper<RecaptureRecord> monthWrapper = new LambdaQueryWrapper<>();
        monthWrapper.ge(RecaptureRecord::getCatchDate, firstOfMonth).lt(RecaptureRecord::getCatchDate, lastOfMonth);
        List<RecaptureRecord> monthRecords = recaptureRecordMapper.selectList(monthWrapper);
        BigDecimal monthRecapture = monthRecords.stream().map(RecaptureRecord::getCatchWeight).reduce(BigDecimal.ZERO, BigDecimal::add);
        overview.put("monthRecapture", monthRecapture);

        int currentYear = LocalDate.now().getYear();
        LocalDateTime yearStart = LocalDateTime.of(currentYear, 1, 1, 0, 0);
        LocalDateTime yearEnd = LocalDateTime.of(currentYear + 1, 1, 1, 0, 0);
        LambdaQueryWrapper<ReleaseRecord> areaWrapper = new LambdaQueryWrapper<>();
        areaWrapper.ge(ReleaseRecord::getReleaseTime, yearStart).lt(ReleaseRecord::getReleaseTime, yearEnd);
        List<ReleaseRecord> yearRecords = releaseRecordMapper.selectList(areaWrapper);
        long activeAreas = yearRecords.stream().map(ReleaseRecord::getAreaId).distinct().count();
        overview.put("activeAreas", activeAreas);

        List<WaterQuality> warnings = waterQualityMapper.selectWarnings();
        overview.put("warningCount", warnings.size());

        return overview;
    }

    @Override
    public List<Map<String, Object>> getPlanProgress() {
        int currentYear = LocalDate.now().getYear();
        LambdaQueryWrapper<ReleaseRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.ge(ReleaseRecord::getReleaseTime, LocalDateTime.of(currentYear, 1, 1, 0, 0));
        List<ReleaseRecord> records = releaseRecordMapper.selectList(wrapper);

        Map<Long, Long> quantityByArea = new HashMap<>();
        for (ReleaseRecord record : records) {
            quantityByArea.merge(record.getAreaId(), record.getActualQuantity(), Long::sum);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Long, Long> entry : quantityByArea.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("areaId", entry.getKey());
            item.put("totalQuantity", entry.getValue());
            result.add(item);
        }
        return result;
    }

    @Override
    public List<Map<String, Object>> getRecaptureTrend() {
        int currentYear = LocalDate.now().getYear();
        return recaptureRecordMapper.selectMonthlyTrend(currentYear);
    }

    @Override
    public List<Map<String, Object>> getWaterWarnings() {
        List<WaterQuality> warnings = waterQualityMapper.selectWarnings();
        List<Map<String, Object>> result = new ArrayList<>();
        for (WaterQuality wq : warnings) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", wq.getId());
            item.put("areaName", wq.getAreaName());
            item.put("salinity", wq.getSalinity());
            item.put("temperature", wq.getTemperature());
            item.put("dissolvedOxygen", wq.getDissolvedOxygen());
            item.put("monitorTime", wq.getMonitorTime());

            List<String> reasons = new ArrayList<>();
            if (wq.getSalinity() != null && (wq.getSalinity().compareTo(BigDecimal.valueOf(25)) < 0 || wq.getSalinity().compareTo(BigDecimal.valueOf(35)) > 0)) {
                reasons.add("盐度异常");
            }
            if (wq.getTemperature() != null && (wq.getTemperature().compareTo(BigDecimal.valueOf(10)) < 0 || wq.getTemperature().compareTo(BigDecimal.valueOf(30)) > 0)) {
                reasons.add("温度异常");
            }
            if (wq.getDissolvedOxygen() != null && wq.getDissolvedOxygen().compareTo(BigDecimal.valueOf(5)) < 0) {
                reasons.add("溶氧量不足");
            }
            item.put("warnings", reasons);
            result.add(item);
        }
        return result;
    }
}
