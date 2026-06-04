package com.craftbeer.brewing.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.craftbeer.brewing.common.Result;
import com.craftbeer.brewing.entity.BatchProcessRecord;
import com.craftbeer.brewing.service.BatchProcessRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 批次工序记录Controller
 */
@RestController
@RequestMapping("/batch-process-records")
@RequiredArgsConstructor
public class BatchProcessRecordController {

    private final BatchProcessRecordService batchProcessRecordService;

    @GetMapping("/batch/{batchId}")
    public Result<List<BatchProcessRecord>> getByBatchId(@PathVariable Long batchId) {
        LambdaQueryWrapper<BatchProcessRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BatchProcessRecord::getBatchId, batchId)
                .orderByAsc(BatchProcessRecord::getStartTime);
        return Result.success(batchProcessRecordService.list(wrapper));
    }

    @GetMapping("/{id}")
    public Result<BatchProcessRecord> getById(@PathVariable Long id) {
        return Result.success(batchProcessRecordService.getById(id));
    }

    @PostMapping
    public Result<BatchProcessRecord> add(@RequestBody BatchProcessRecord record) {
        batchProcessRecordService.save(record);
        return Result.success(record);
    }

    @PutMapping
    public Result<Void> update(@RequestBody BatchProcessRecord record) {
        batchProcessRecordService.updateById(record);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        batchProcessRecordService.removeById(id);
        return Result.success();
    }
}
