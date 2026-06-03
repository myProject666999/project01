package com.monitoring.wastewater.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.monitoring.wastewater.entity.DischargePoint;
import com.monitoring.wastewater.mapper.DischargePointMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DischargePointService extends ServiceImpl<DischargePointMapper, DischargePoint> {

    public List<DischargePoint> getAllPoints() {
        return list();
    }

    public List<DischargePoint> getActivePoints() {
        return list(new LambdaQueryWrapper<DischargePoint>()
                .eq(DischargePoint::getStatus, 1));
    }

    public DischargePoint getByCode(String pointCode) {
        return getOne(new LambdaQueryWrapper<DischargePoint>()
                .eq(DischargePoint::getPointCode, pointCode));
    }

    public boolean updatePointStatus(Long id, Integer status) {
        DischargePoint point = new DischargePoint();
        point.setId(id);
        point.setStatus(status);
        return updateById(point);
    }
}
