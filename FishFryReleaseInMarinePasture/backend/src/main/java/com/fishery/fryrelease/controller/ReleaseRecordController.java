package com.fishery.fryrelease.controller;

import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.common.Result;
import com.fishery.fryrelease.entity.ReleaseRecord;
import com.fishery.fryrelease.service.ReleaseRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/release-records")
public class ReleaseRecordController {

    @Autowired
    private ReleaseRecordService releaseRecordService;

    @GetMapping
    public Result<PageResult<ReleaseRecord>> getPage(PageRequest pageRequest,
                                                      @RequestParam(required = false) Long areaId,
                                                      @RequestParam(required = false) Long speciesId,
                                                      @RequestParam(required = false) String startDate,
                                                      @RequestParam(required = false) String endDate) {
        return Result.success(releaseRecordService.getPage(pageRequest, areaId, speciesId, startDate, endDate));
    }

    @GetMapping("/{id}")
    public Result<ReleaseRecord> getById(@PathVariable Long id) {
        return Result.success(releaseRecordService.getById(id));
    }

    @PostMapping
    public Result<Void> save(@RequestBody ReleaseRecord releaseRecord) {
        releaseRecordService.save(releaseRecord);
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody ReleaseRecord releaseRecord) {
        releaseRecord.setId(id);
        releaseRecordService.updateById(releaseRecord);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> remove(@PathVariable Long id) {
        releaseRecordService.removeById(id);
        return Result.success();
    }
}
