package com.monitoring.wastewater.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.monitoring.wastewater.common.Result;
import com.monitoring.wastewater.dto.ShutdownOrderConfirmDTO;
import com.monitoring.wastewater.dto.ShutdownOrderExecuteDTO;
import com.monitoring.wastewater.entity.ShutdownOrder;
import com.monitoring.wastewater.service.ShutdownOrderService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("/shutdown-order")
public class ShutdownOrderController {

    @Resource
    private ShutdownOrderService shutdownOrderService;

    @GetMapping("/list")
    public Result<Page<ShutdownOrder>> getOrderList(
            @RequestParam(required = false) Long pointId,
            @RequestParam(required = false) Integer orderStatus,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return Result.success(shutdownOrderService.getOrderList(
                pointId, orderStatus, pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public Result<ShutdownOrder> getById(@PathVariable Long id) {
        return Result.success(shutdownOrderService.getById(id));
    }

    @PostMapping("/confirm")
    public Result<Boolean> confirmOrder(@RequestBody ShutdownOrderConfirmDTO dto) {
        return Result.success(shutdownOrderService.confirmOrder(dto));
    }

    @PostMapping("/execute")
    public Result<Boolean> executeOrder(@RequestBody ShutdownOrderExecuteDTO dto) {
        return Result.success(shutdownOrderService.executeOrder(dto));
    }

    @GetMapping("/pending-count")
    public Result<Long> getPendingOrderCount() {
        return Result.success(shutdownOrderService.getPendingOrderCount());
    }
}
