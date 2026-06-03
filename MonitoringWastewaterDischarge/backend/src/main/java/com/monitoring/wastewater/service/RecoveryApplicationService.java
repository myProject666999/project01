package com.monitoring.wastewater.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.monitoring.wastewater.dto.RecoveryApplicationDTO;
import com.monitoring.wastewater.dto.RecoveryApprovalDTO;
import com.monitoring.wastewater.entity.RecoveryApplication;
import com.monitoring.wastewater.entity.ShutdownOrder;
import com.monitoring.wastewater.mapper.RecoveryApplicationMapper;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.time.LocalDateTime;

@Service
public class RecoveryApplicationService extends ServiceImpl<RecoveryApplicationMapper, RecoveryApplication> {

    @Resource
    private ShutdownOrderService shutdownOrderService;

    @Resource
    private DischargePointService dischargePointService;

    public RecoveryApplication createApplication(RecoveryApplicationDTO dto) {
        ShutdownOrder shutdownOrder = shutdownOrderService.getById(dto.getShutdownOrderId());
        if (shutdownOrder == null || shutdownOrder.getOrderStatus() != 2) {
            return null;
        }

        RecoveryApplication application = new RecoveryApplication();
        application.setApplicationNo("RA" + System.currentTimeMillis());
        application.setShutdownOrderId(dto.getShutdownOrderId());
        application.setPointId(dto.getPointId());
        application.setPointCode(dto.getPointCode());
        application.setApplicant(dto.getApplicant());
        application.setReasonHandled(dto.getReasonHandled());
        application.setTestReport(dto.getTestReport());
        application.setApplicationStatus(0);
        application.setCreateTime(LocalDateTime.now());
        application.setUpdateTime(LocalDateTime.now());
        save(application);
        return application;
    }

    public boolean approveApplication(RecoveryApprovalDTO dto) {
        RecoveryApplication application = getById(dto.getId());
        if (application == null || application.getApplicationStatus() != 0) {
            return false;
        }

        application.setApplicationStatus(dto.getApplicationStatus());
        application.setApprover(dto.getApprover());
        application.setApprovalOpinion(dto.getApprovalOpinion());
        application.setApprovalTime(LocalDateTime.now());
        application.setUpdateTime(LocalDateTime.now());

        if (dto.getApplicationStatus() == 1) {
            application.setRecoveryTime(LocalDateTime.now());
            shutdownOrderService.completeOrder(application.getShutdownOrderId());
            dischargePointService.updatePointStatus(application.getPointId(), 1);
        }

        return updateById(application);
    }

    public Page<RecoveryApplication> getApplicationList(Long pointId, Integer applicationStatus,
                                                        Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<RecoveryApplication> wrapper = new LambdaQueryWrapper<>();
        if (pointId != null) {
            wrapper.eq(RecoveryApplication::getPointId, pointId);
        }
        if (applicationStatus != null) {
            wrapper.eq(RecoveryApplication::getApplicationStatus, applicationStatus);
        }
        wrapper.orderByDesc(RecoveryApplication::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public long getPendingApprovalCount() {
        return count(new LambdaQueryWrapper<RecoveryApplication>()
                .eq(RecoveryApplication::getApplicationStatus, 0));
    }
}
