package com.monitoring.wastewater.service;

import com.alibaba.fastjson2.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.monitoring.wastewater.entity.EnvReportRecord;
import com.monitoring.wastewater.entity.MonitorData;
import com.monitoring.wastewater.mapper.EnvReportRecordMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class EnvReportService extends ServiceImpl<EnvReportRecordMapper, EnvReportRecord> {

    @Value("${monitoring.env-report.enabled:true}")
    private boolean reportEnabled;

    @Value("${monitoring.env-report.url:http://env-platform.example.com/report}")
    private String reportUrl;

    @Resource
    private MonitorDataService monitorDataService;

    public void reportMonitorData(MonitorData data) {
        if (!reportEnabled) {
            return;
        }

        EnvReportRecord record = new EnvReportRecord();
        record.setMonitorDataId(data.getId());
        record.setPointId(data.getPointId());
        record.setPointCode(data.getPointCode());
        record.setReportContent(buildReportContent(data));
        record.setReportStatus(0);
        record.setRetryCount(0);
        record.setCreateTime(LocalDateTime.now());

        try {
            boolean success = doReport(record);
            if (success) {
                record.setReportStatus(1);
                record.setReportTime(LocalDateTime.now());
                record.setResponseContent("{\"code\":200,\"message\":\"报送成功\"}");

                data.setReportStatus(1);
                data.setReportTime(LocalDateTime.now());
                monitorDataService.updateById(data);
            } else {
                record.setReportStatus(2);
                record.setResponseContent("{\"code\":500,\"message\":\"报送失败\"}");
            }
        } catch (Exception e) {
            log.error("报送环保平台数据异常", e);
            record.setReportStatus(2);
            record.setResponseContent("{\"code\":500,\"message\":\"报送异常: " + e.getMessage() + "\"}");
        }

        save(record);
    }

    private String buildReportContent(MonitorData data) {
        Map<String, Object> content = new HashMap<>();
        content.put("pointCode", data.getPointCode());
        content.put("monitorTime", data.getMonitorTime().toString());
        content.put("cod", data.getCodValue());
        content.put("ph", data.getPhValue());
        content.put("color", data.getColorValue());
        content.put("ammonia", data.getAmmoniaValue());
        content.put("isOverLimit", data.getIsOverLimit());
        content.put("overLimitIndicators", data.getOverLimitIndicators());
        content.put("reportTime", LocalDateTime.now().toString());
        return JSON.toJSONString(content);
    }

    private boolean doReport(EnvReportRecord record) {
        log.info("模拟报送环保平台数据: pointCode={}, content={}",
                record.getPointCode(), record.getReportContent());
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return true;
    }

    public void retryFailedReports() {
        List<EnvReportRecord> failedRecords = list(new LambdaQueryWrapper<EnvReportRecord>()
                .eq(EnvReportRecord::getReportStatus, 2)
                .lt(EnvReportRecord::getRetryCount, 3)
                .orderByAsc(EnvReportRecord::getCreateTime)
                .last("LIMIT 10"));

        for (EnvReportRecord record : failedRecords) {
            try {
                boolean success = doReport(record);
                record.setRetryCount(record.getRetryCount() + 1);
                if (success) {
                    record.setReportStatus(1);
                    record.setReportTime(LocalDateTime.now());
                    record.setResponseContent("{\"code\":200,\"message\":\"重发报送成功\"}");

                    MonitorData data = monitorDataService.getById(record.getMonitorDataId());
                    if (data != null) {
                        data.setReportStatus(1);
                        data.setReportTime(LocalDateTime.now());
                        monitorDataService.updateById(data);
                    }
                } else {
                    record.setResponseContent("{\"code\":500,\"message\":\"重发报送失败\"}");
                }
                updateById(record);
            } catch (Exception e) {
                log.error("重发报送异常", e);
            }
        }
    }

    public Page<EnvReportRecord> getReportList(Long pointId, Integer reportStatus,
                                               Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<EnvReportRecord> wrapper = new LambdaQueryWrapper<>();
        if (pointId != null) {
            wrapper.eq(EnvReportRecord::getPointId, pointId);
        }
        if (reportStatus != null) {
            wrapper.eq(EnvReportRecord::getReportStatus, reportStatus);
        }
        wrapper.orderByDesc(EnvReportRecord::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }
}
