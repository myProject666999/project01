package com.monitoring.wastewater.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.monitoring.wastewater.dto.ShutdownOrderConfirmDTO;
import com.monitoring.wastewater.dto.ShutdownOrderExecuteDTO;
import com.monitoring.wastewater.entity.MonitorData;
import com.monitoring.wastewater.entity.ShutdownOrder;
import com.monitoring.wastewater.mapper.ShutdownOrderMapper;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class ShutdownOrderService extends ServiceImpl<ShutdownOrderMapper, ShutdownOrder> {

    private static final Map<String, String> INDICATOR_NAME_MAP = new HashMap<>();

    static {
        INDICATOR_NAME_MAP.put("COD", "化学需氧量(COD)");
        INDICATOR_NAME_MAP.put("pH", "pH值");
        INDICATOR_NAME_MAP.put("COLOR", "色度");
        INDICATOR_NAME_MAP.put("AMMONIA", "氨氮");
    }

    @Resource
    private DischargePointService dischargePointService;

    public boolean hasActiveShutdownOrder(Long pointId, String indicator) {
        return count(new LambdaQueryWrapper<ShutdownOrder>()
                .eq(ShutdownOrder::getPointId, pointId)
                .eq(ShutdownOrder::getTriggerIndicator, indicator)
                .in(ShutdownOrder::getOrderStatus, 0, 1, 2)) > 0;
    }

    public ShutdownOrder createShutdownOrder(MonitorData data, String indicator,
                                             BigDecimal triggerValue, BigDecimal thresholdValue,
                                             int continuousMinutes) {
        ShutdownOrder order = new ShutdownOrder();
        order.setOrderNo("SD" + System.currentTimeMillis());
        order.setPointId(data.getPointId());
        order.setPointCode(data.getPointCode());
        order.setTriggerIndicator(indicator);
        order.setTriggerIndicatorName(INDICATOR_NAME_MAP.getOrDefault(indicator, indicator));
        order.setTriggerValue(triggerValue);
        order.setThresholdValue(thresholdValue);
        order.setContinuousMinutes(continuousMinutes);
        order.setOrderStatus(0);
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        save(order);
        return order;
    }

    public boolean confirmOrder(ShutdownOrderConfirmDTO dto) {
        ShutdownOrder order = getById(dto.getId());
        if (order == null || order.getOrderStatus() != 0) {
            return false;
        }
        order.setOperatorName(dto.getOperatorName());
        order.setConfirmTime(LocalDateTime.now());
        order.setOrderStatus(1);
        order.setUpdateTime(LocalDateTime.now());
        return updateById(order);
    }

    public boolean executeOrder(ShutdownOrderExecuteDTO dto) {
        ShutdownOrder order = getById(dto.getId());
        if (order == null || order.getOrderStatus() != 1) {
            return false;
        }
        order.setOperatorName(dto.getOperatorName());
        order.setExecuteTime(LocalDateTime.now());
        order.setReasonAnalysis(dto.getReasonAnalysis());
        order.setProcessAdjustment(dto.getProcessAdjustment());
        order.setOrderStatus(2);
        order.setUpdateTime(LocalDateTime.now());
        return updateById(order);
    }

    public boolean completeOrder(Long id) {
        ShutdownOrder order = getById(id);
        if (order == null) {
            return false;
        }
        order.setOrderStatus(3);
        order.setUpdateTime(LocalDateTime.now());
        return updateById(order);
    }

    public Page<ShutdownOrder> getOrderList(Long pointId, Integer orderStatus,
                                            Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<ShutdownOrder> wrapper = new LambdaQueryWrapper<>();
        if (pointId != null) {
            wrapper.eq(ShutdownOrder::getPointId, pointId);
        }
        if (orderStatus != null) {
            wrapper.eq(ShutdownOrder::getOrderStatus, orderStatus);
        }
        wrapper.orderByDesc(ShutdownOrder::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public long getPendingOrderCount() {
        return count(new LambdaQueryWrapper<ShutdownOrder>()
                .in(ShutdownOrder::getOrderStatus, 0, 1));
    }
}
