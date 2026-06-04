package com.craftbeer.brewing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.craftbeer.brewing.common.Result;
import com.craftbeer.brewing.dto.TraceabilityQueryDTO;
import com.craftbeer.brewing.entity.BatchTraceability;
import com.craftbeer.brewing.service.BatchTraceabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 批次追溯Controller
 */
@RestController
@RequestMapping("/batch-traceability")
@RequiredArgsConstructor
public class BatchTraceabilityController {

    private final BatchTraceabilityService batchTraceabilityService;

    @PostMapping("/query")
    public Result<IPage<BatchTraceability>> query(@RequestBody TraceabilityQueryDTO queryDTO) {
        return Result.success(batchTraceabilityService.queryTraceability(queryDTO));
    }

    @GetMapping("/batch/{batchId}")
    public Result<BatchTraceability> getByBatchId(@PathVariable Long batchId) {
        return Result.success(batchTraceabilityService.getByBatchId(batchId));
    }

    @GetMapping("/{id}")
    public Result<BatchTraceability> getById(@PathVariable Long id) {
        return Result.success(batchTraceabilityService.getById(id));
    }

    @PostMapping
    public Result<BatchTraceability> add(@RequestBody BatchTraceability traceability) {
        BatchTraceability result = batchTraceabilityService.createTraceability(traceability);
        return Result.success(result);
    }

    @PostMapping("/analyze/{batchId}")
    public Result<BatchTraceability> analyze(@PathVariable Long batchId,
                                             @RequestParam(defaultValue = "BOTH") String traceType) {
        BatchTraceability result = batchTraceabilityService.analyzeTraceability(batchId, traceType);
        return Result.success("追溯分析完成", result);
    }

    @PutMapping
    public Result<Void> update(@RequestBody BatchTraceability traceability) {
        batchTraceabilityService.updateById(traceability);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        batchTraceabilityService.removeById(id);
        return Result.success();
    }
}
