package com.fishery.fryrelease.controller;

import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.common.Result;
import com.fishery.fryrelease.entity.ReleasePlan;
import com.fishery.fryrelease.service.ReleasePlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/release-plans")
public class ReleasePlanController {

    @Autowired
    private ReleasePlanService releasePlanService;

    @GetMapping
    public Result<PageResult<ReleasePlan>> getPage(PageRequest pageRequest,
                                                    @RequestParam(required = false) Long areaId,
                                                    @RequestParam(required = false) Long speciesId,
                                                    @RequestParam(required = false) Integer planYear,
                                                    @RequestParam(required = false) String status) {
        return Result.success(releasePlanService.getPage(pageRequest, areaId, speciesId, planYear, status));
    }

    @GetMapping("/{id}")
    public Result<ReleasePlan> getById(@PathVariable Long id) {
        return Result.success(releasePlanService.getById(id));
    }

    @PostMapping
    public Result<Void> save(@RequestBody ReleasePlan releasePlan) {
        releasePlanService.save(releasePlan);
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody ReleasePlan releasePlan) {
        releasePlan.setId(id);
        releasePlanService.updateById(releasePlan);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> remove(@PathVariable Long id) {
        releasePlanService.removeById(id);
        return Result.success();
    }

    @GetMapping("/progress")
    public Result<List<Map<String, Object>>> getProgress() {
        return Result.success(releasePlanService.getProgress());
    }
}
