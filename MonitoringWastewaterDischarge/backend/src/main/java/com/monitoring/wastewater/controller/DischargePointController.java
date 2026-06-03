package com.monitoring.wastewater.controller;

import com.monitoring.wastewater.common.Result;
import com.monitoring.wastewater.entity.DischargePoint;
import com.monitoring.wastewater.service.DischargePointService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

@RestController
@RequestMapping("/discharge-point")
public class DischargePointController {

    @Resource
    private DischargePointService dischargePointService;

    @GetMapping("/list")
    public Result<List<DischargePoint>> list() {
        return Result.success(dischargePointService.getAllPoints());
    }

    @GetMapping("/active")
    public Result<List<DischargePoint>> activeList() {
        return Result.success(dischargePointService.getActivePoints());
    }

    @GetMapping("/{id}")
    public Result<DischargePoint> getById(@PathVariable Long id) {
        return Result.success(dischargePointService.getById(id));
    }

    @GetMapping("/code/{pointCode}")
    public Result<DischargePoint> getByCode(@PathVariable String pointCode) {
        return Result.success(dischargePointService.getByCode(pointCode));
    }

    @PostMapping
    public Result<Boolean> add(@RequestBody DischargePoint point) {
        return Result.success(dischargePointService.save(point));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody DischargePoint point) {
        return Result.success(dischargePointService.updateById(point));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(dischargePointService.removeById(id));
    }
}
