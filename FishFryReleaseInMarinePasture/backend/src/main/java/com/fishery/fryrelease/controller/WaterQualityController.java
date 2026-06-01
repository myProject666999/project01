package com.fishery.fryrelease.controller;

import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.common.Result;
import com.fishery.fryrelease.entity.WaterQuality;
import com.fishery.fryrelease.service.WaterQualityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/water-quality")
public class WaterQualityController {

    @Autowired
    private WaterQualityService waterQualityService;

    @GetMapping
    public Result<PageResult<WaterQuality>> getPage(PageRequest pageRequest,
                                                     @RequestParam(required = false) Long areaId,
                                                     @RequestParam(required = false) String startDate,
                                                     @RequestParam(required = false) String endDate) {
        return Result.success(waterQualityService.getPage(pageRequest, areaId, startDate, endDate));
    }

    @GetMapping("/{id}")
    public Result<WaterQuality> getById(@PathVariable Long id) {
        return Result.success(waterQualityService.getById(id));
    }

    @PostMapping
    public Result<Void> save(@RequestBody WaterQuality waterQuality) {
        waterQualityService.save(waterQuality);
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody WaterQuality waterQuality) {
        waterQuality.setId(id);
        waterQualityService.updateById(waterQuality);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> remove(@PathVariable Long id) {
        waterQualityService.removeById(id);
        return Result.success();
    }

    @GetMapping("/trend")
    public Result<List<Map<String, Object>>> getTrend(@RequestParam(required = false) Long areaId,
                                                       @RequestParam(required = false) String startDate,
                                                       @RequestParam(required = false) String endDate) {
        return Result.success(waterQualityService.getTrend(areaId, startDate, endDate));
    }

    @GetMapping("/warnings")
    public Result<List<WaterQuality>> getWarnings() {
        return Result.success(waterQualityService.getWarnings());
    }
}
