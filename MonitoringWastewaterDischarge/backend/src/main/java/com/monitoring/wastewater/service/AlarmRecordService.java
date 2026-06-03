package com.monitoring.wastewater.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.monitoring.wastewater.entity.AlarmRecord;
import com.monitoring.wastewater.entity.MonitorData;
import com.monitoring.wastewater.mapper.AlarmRecordMapper;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AlarmRecordService extends ServiceImpl<AlarmRecordMapper, AlarmRecord> {

    private static final Map<String, String> INDICATOR_NAME_MAP = new HashMap<>();

    static {
        INDICATOR_NAME_MAP.put("COD", "化学需氧量(COD)");
        INDICATOR_NAME_MAP.put("pH", "pH值");
        INDICATOR_NAME_MAP.put("COLOR", "色度");
        INDICATOR_NAME_MAP.put("AMMONIA", "氨氮");
    }

    @Resource
    private MonitorDataService monitorDataService;

    public void createAlarm(MonitorData data, String indicator, BigDecimal currentValue,
                            BigDecimal thresholdValue, int continuousMinutes) {
        AlarmRecord alarm = new AlarmRecord();
        alarm.setPointId(data.getPointId());
        alarm.setPointCode(data.getPointCode());
        alarm.setIndicator(indicator);
        alarm.setIndicatorName(INDICATOR_NAME_MAP.getOrDefault(indicator, indicator));
        alarm.setCurrentValue(currentValue);
        alarm.setThresholdValue(thresholdValue);
        alarm.setContinuousMinutes(continuousMinutes);
        alarm.setMonitorTime(data.getMonitorTime());
        alarm.setAlarmLevel(continuousMinutes >= 3 ? 2 : 1);
        alarm.setCreateTime(LocalDateTime.now());
        save(alarm);
    }

    public Page<AlarmRecord> getAlarmList(Long pointId, Integer alarmLevel,
                                          LocalDateTime startTime, LocalDateTime endTime,
                                          Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<AlarmRecord> wrapper = new LambdaQueryWrapper<>();
        if (pointId != null) {
            wrapper.eq(AlarmRecord::getPointId, pointId);
        }
        if (alarmLevel != null) {
            wrapper.eq(AlarmRecord::getAlarmLevel, alarmLevel);
        }
        if (startTime != null) {
            wrapper.ge(AlarmRecord::getMonitorTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(AlarmRecord::getMonitorTime, endTime);
        }
        wrapper.orderByDesc(AlarmRecord::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public long getUnprocessedAlarmCount() {
        return count(new LambdaQueryWrapper<AlarmRecord>()
                .ge(AlarmRecord::getCreateTime, LocalDateTime.now().minusHours(24)));
    }
}
