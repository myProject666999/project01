package com.maritime.pilotage.controller;

import com.maritime.pilotage.common.Result;
import com.maritime.pilotage.entity.PilotageOrder;
import com.maritime.pilotage.repository.PilotageOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pilotage-orders")
public class PilotageOrderController {

    @Autowired
    private PilotageOrderRepository pilotageOrderRepository;

    @GetMapping
    public Result<List<PilotageOrder>> list() {
        List<PilotageOrder> list = pilotageOrderRepository.findAll();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<PilotageOrder> getById(@PathVariable Long id) {
        Optional<PilotageOrder> order = pilotageOrderRepository.findById(id);
        return order.map(Result::success).orElseGet(() -> Result.error("预约单不存在"));
    }

    @PostMapping
    public Result<PilotageOrder> create(@RequestBody PilotageOrder order) {
        PilotageOrder saved = pilotageOrderRepository.save(order);
        return Result.success("创建成功", saved);
    }

    @PutMapping("/{id}")
    public Result<PilotageOrder> update(@PathVariable Long id, @RequestBody PilotageOrder order) {
        if (!pilotageOrderRepository.existsById(id)) {
            return Result.error("预约单不存在");
        }
        order.setId(id);
        PilotageOrder updated = pilotageOrderRepository.save(order);
        return Result.success("更新成功", updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (!pilotageOrderRepository.existsById(id)) {
            return Result.error("预约单不存在");
        }
        pilotageOrderRepository.deleteById(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/search")
    public Result<List<PilotageOrder>> search(@RequestParam(required = false) String orderNo,
                                               @RequestParam(required = false) Long vesselId,
                                               @RequestParam(required = false) Integer status,
                                               @RequestParam(required = false) Integer pilotageType) {
        List<PilotageOrder> list = pilotageOrderRepository.findAll();
        if (orderNo != null) {
            list = list.stream().filter(o -> orderNo.equals(o.getOrderNo())).collect(Collectors.toList());
        }
        if (vesselId != null) {
            list = list.stream().filter(o -> vesselId.equals(o.getVesselId())).collect(Collectors.toList());
        }
        if (status != null) {
            list = list.stream().filter(o -> status.equals(o.getStatus())).collect(Collectors.toList());
        }
        if (pilotageType != null) {
            list = list.stream().filter(o -> pilotageType.equals(o.getPilotageType())).collect(Collectors.toList());
        }
        return Result.success(list);
    }

    @GetMapping("/status/{status}")
    public Result<List<PilotageOrder>> getByStatus(@PathVariable Integer status) {
        List<PilotageOrder> list = pilotageOrderRepository.findAll().stream()
                .filter(o -> status.equals(o.getStatus()))
                .collect(Collectors.toList());
        return Result.success(list);
    }

    @GetMapping("/pending")
    public Result<List<PilotageOrder>> getPendingOrders() {
        List<PilotageOrder> list = pilotageOrderRepository.findAll().stream()
                .filter(o -> o.getStatus() == 1)
                .collect(Collectors.toList());
        return Result.success(list);
    }

    @GetMapping("/eta-range")
    public Result<List<PilotageOrder>> getByEtaRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<PilotageOrder> list = pilotageOrderRepository.findAll().stream()
                .filter(o -> !o.getEta().isAfter(start) && !o.getEta().isBefore(end))
                .collect(Collectors.toList());
        return Result.success(list);
    }
}
