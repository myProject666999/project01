package com.monitoring.wastewater.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.monitoring.wastewater.dto.MonitorDataDTO;
import com.monitoring.wastewater.entity.DischargePoint;
import com.monitoring.wastewater.entity.MonitorData;
import com.monitoring.wastewater.mapper.MonitorDataMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class MonitorDataService extends ServiceImpl<MonitorDataMapper, MonitorData> {

    private static final String REDIS_KEY_PREFIX = "monitor:data:";
    private static final String REDIS_REALTIME_KEY = "monitor:realtime:";

    @Resource
    private RedisTemplate<String, Object> redisTemplate;

    @Resource
    private DischargePointService dischargePointService;

    public MonitorData saveMonitorData(MonitorDataDTO dto) {
        MonitorData data = new MonitorData();
        BeanUtils.copyProperties(dto, data);
        if (data.getMonitorTime() == null) {
            data.setMonitorTime(LocalDateTime.now());
        }
        data.setCreateTime(LocalDateTime.now());

        DischargePoint point = dischargePointService.getById(dto.getPointId());
        if (point != null) {
            checkOverLimit(data, point);
        }

        save(data);
        saveToRedis(data);
        return data;
    }

    private void checkOverLimit(MonitorData data, DischargePoint point) {
        List<String> overLimitIndicators = new ArrayList<>();

        if (data.getCodValue().compareTo(point.getCodThreshold()) > 0) {
            overLimitIndicators.add("COD");
        }
        if (data.getPhValue().compareTo(point.getPhMinThreshold()) < 0
                || data.getPhValue().compareTo(point.getPhMaxThreshold()) > 0) {
            overLimitIndicators.add("pH");
        }
        if (data.getColorValue().compareTo(point.getColorThreshold()) > 0) {
            overLimitIndicators.add("COLOR");
        }
        if (data.getAmmoniaValue().compareTo(point.getAmmoniaThreshold()) > 0) {
            overLimitIndicators.add("AMMONIA");
        }

        if (!overLimitIndicators.isEmpty()) {
            data.setIsOverLimit(1);
            data.setOverLimitIndicators(String.join(",", overLimitIndicators));
        } else {
            data.setIsOverLimit(0);
            data.setOverLimitIndicators(null);
        }
    }

    private void saveToRedis(MonitorData data) {
        String key = REDIS_KEY_PREFIX + data.getPointCode();
        redisTemplate.opsForList().leftPush(key, data);
        redisTemplate.opsForList().trim(key, 0, 1439);
        redisTemplate.expire(key, 24, TimeUnit.HOURS);

        String realtimeKey = REDIS_REALTIME_KEY + data.getPointCode();
        redisTemplate.opsForValue().set(realtimeKey, data, 2, TimeUnit.MINUTES);
    }

    public MonitorData getRealtimeData(String pointCode) {
        String key = REDIS_REALTIME_KEY + pointCode;
        Object obj = redisTemplate.opsForValue().get(key);
        if (obj instanceof MonitorData) {
            return (MonitorData) obj;
        }
        return getOne(new LambdaQueryWrapper<MonitorData>()
                .eq(MonitorData::getPointCode, pointCode)
                .orderByDesc(MonitorData::getMonitorTime)
                .last("LIMIT 1"));
    }

    public List<MonitorData> getRecentData(String pointCode, int minutes) {
        String key = REDIS_KEY_PREFIX + pointCode;
        List<Object> list = redisTemplate.opsForList().range(key, 0, minutes - 1);
        List<MonitorData> result = new ArrayList<>();
        if (list != null) {
            for (Object obj : list) {
                if (obj instanceof MonitorData) {
                    result.add((MonitorData) obj);
                }
            }
        }
        if (result.isEmpty()) {
            LocalDateTime startTime = LocalDateTime.now().minusMinutes(minutes);
            result = list(new LambdaQueryWrapper<MonitorData>()
                    .eq(MonitorData::getPointCode, pointCode)
                    .ge(MonitorData::getMonitorTime, startTime)
                    .orderByDesc(MonitorData::getMonitorTime));
        }
        return result;
    }

    public Page<MonitorData> getHistoryData(Long pointId, LocalDateTime startTime,
                                            LocalDateTime endTime, Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<MonitorData> wrapper = new LambdaQueryWrapper<>();
        if (pointId != null) {
            wrapper.eq(MonitorData::getPointId, pointId);
        }
        if (startTime != null) {
            wrapper.ge(MonitorData::getMonitorTime, startTime);
        }
        if (endTime != null) {
            wrapper.le(MonitorData::getMonitorTime, endTime);
        }
        wrapper.orderByDesc(MonitorData::getMonitorTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public boolean isIndicatorOverLimit(String pointCode, String indicator, int minutes) {
        List<MonitorData> recentData = getRecentData(pointCode, minutes);
        if (recentData.size() < minutes) {
            return false;
        }
        for (MonitorData data : recentData.subList(0, minutes)) {
            if (data.getOverLimitIndicators() == null
                    || !data.getOverLimitIndicators().contains(indicator)) {
                return false;
            }
        }
        return true;
    }

    public int getContinuousOverLimitMinutes(String pointCode, String indicator) {
        List<MonitorData> recentData = getRecentData(pointCode, 60);
        int count = 0;
        for (MonitorData data : recentData) {
            if (data.getOverLimitIndicators() != null
                    && data.getOverLimitIndicators().contains(indicator)) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }
}
