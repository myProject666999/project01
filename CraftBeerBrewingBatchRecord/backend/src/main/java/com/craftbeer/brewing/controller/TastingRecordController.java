package com.craftbeer.brewing.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.craftbeer.brewing.common.Result;
import com.craftbeer.brewing.entity.TastingRecord;
import com.craftbeer.brewing.service.TastingRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 品测记录Controller
 */
@RestController
@RequestMapping("/tasting-records")
@RequiredArgsConstructor
public class TastingRecordController {

    private final TastingRecordService tastingRecordService;

    @GetMapping("/page")
    public Result<IPage<TastingRecord>> page(@RequestParam(defaultValue = "1") Integer pageNum,
                                             @RequestParam(defaultValue = "10") Integer pageSize,
                                             @RequestParam(required = false) String finalJudgment) {
        LambdaQueryWrapper<TastingRecord> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(finalJudgment)) {
            wrapper.eq(TastingRecord::getFinalJudgment, finalJudgment);
        }
        wrapper.orderByDesc(TastingRecord::getTastingTime);
        return Result.success(tastingRecordService.page(new Page<>(pageNum, pageSize), wrapper));
    }

    @GetMapping("/batch/{batchId}")
    public Result<List<TastingRecord>> getByBatchId(@PathVariable Long batchId) {
        return Result.success(tastingRecordService.getByBatchId(batchId));
    }

    @GetMapping("/batch/{batchId}/average")
    public Result<TastingRecord> getAverageScores(@PathVariable Long batchId) {
        return Result.success(tastingRecordService.getAverageScores(batchId));
    }

    @GetMapping("/failed")
    public Result<List<TastingRecord>> getFailedRecords() {
        return Result.success(tastingRecordService.getFailedRecords());
    }

    @GetMapping("/{id}")
    public Result<TastingRecord> getById(@PathVariable Long id) {
        return Result.success(tastingRecordService.getById(id));
    }

    @PostMapping
    public Result<Void> add(@RequestBody TastingRecord tastingRecord) {
        tastingRecordService.addTastingRecord(tastingRecord);
        return Result.success();
    }

    @PutMapping
    public Result<Void> update(@RequestBody TastingRecord tastingRecord) {
        tastingRecordService.updateById(tastingRecord);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        tastingRecordService.removeById(id);
        return Result.success();
    }
}
