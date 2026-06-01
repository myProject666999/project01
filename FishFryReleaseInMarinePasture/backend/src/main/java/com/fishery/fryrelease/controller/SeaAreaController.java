package com.fishery.fryrelease.controller;

import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.common.Result;
import com.fishery.fryrelease.entity.SeaArea;
import com.fishery.fryrelease.service.SeaAreaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sea-areas")
public class SeaAreaController {

    @Autowired
    private SeaAreaService seaAreaService;

    @GetMapping
    public Result<PageResult<SeaArea>> getPage(PageRequest pageRequest, @RequestParam(required = false) String keyword) {
        return Result.success(seaAreaService.getPage(pageRequest, keyword));
    }

    @GetMapping("/{id}")
    public Result<SeaArea> getById(@PathVariable Long id) {
        return Result.success(seaAreaService.getById(id));
    }

    @PostMapping
    public Result<Void> save(@RequestBody SeaArea seaArea) {
        seaAreaService.save(seaArea);
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody SeaArea seaArea) {
        seaArea.setId(id);
        seaAreaService.updateById(seaArea);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> remove(@PathVariable Long id) {
        seaAreaService.removeById(id);
        return Result.success();
    }
}
