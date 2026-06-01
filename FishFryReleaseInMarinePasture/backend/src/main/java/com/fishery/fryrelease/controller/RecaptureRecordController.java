package com.fishery.fryrelease.controller;

import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.common.Result;
import com.fishery.fryrelease.entity.RecaptureRecord;
import com.fishery.fryrelease.service.RecaptureRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recapture-records")
public class RecaptureRecordController {

    @Autowired
    private RecaptureRecordService recaptureRecordService;

    @GetMapping
    public Result<PageResult<RecaptureRecord>> getPage(PageRequest pageRequest,
                                                        @RequestParam(required = false) Long areaId,
                                                        @RequestParam(required = false) Long speciesId,
                                                        @RequestParam(required = false) String startDate,
                                                        @RequestParam(required = false) String endDate) {
        return Result.success(recaptureRecordService.getPage(pageRequest, areaId, speciesId, startDate, endDate));
    }

    @GetMapping("/{id}")
    public Result<RecaptureRecord> getById(@PathVariable Long id) {
        return Result.success(recaptureRecordService.getById(id));
    }

    @PostMapping
    public Result<Void> save(@RequestBody RecaptureRecord recaptureRecord) {
        recaptureRecordService.save(recaptureRecord);
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody RecaptureRecord recaptureRecord) {
        recaptureRecord.setId(id);
        recaptureRecordService.updateById(recaptureRecord);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> remove(@PathVariable Long id) {
        recaptureRecordService.removeById(id);
        return Result.success();
    }

    @GetMapping("/analysis")
    public Result<List<Map<String, Object>>> getAnalysis(@RequestParam(required = false) Integer year,
                                                          @RequestParam(required = false) Long areaId,
                                                          @RequestParam(required = false) Long speciesId) {
        return Result.success(recaptureRecordService.getAnalysis(year, areaId, speciesId));
    }

    @GetMapping("/analysis/trend")
    public Result<List<Map<String, Object>>> getTrend(@RequestParam(required = false) Integer year) {
        return Result.success(recaptureRecordService.getTrend(year));
    }
}
