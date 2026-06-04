package com.craftbeer.brewing.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.craftbeer.brewing.common.Result;
import com.craftbeer.brewing.dto.BatchDTO;
import com.craftbeer.brewing.dto.TraceabilityQueryDTO;
import com.craftbeer.brewing.entity.BrewingBatch;
import com.craftbeer.brewing.service.BrewingBatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 酿造批次Controller
 */
@RestController
@RequestMapping("/batches")
@RequiredArgsConstructor
public class BrewingBatchController {

    private final BrewingBatchService brewingBatchService;

    @GetMapping
    public Result<List<BrewingBatch>> list() {
        LambdaQueryWrapper<BrewingBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(BrewingBatch::getCreateTime);
        return Result.success(brewingBatchService.list(wrapper));
    }

    @GetMapping("/page")
    public Result<IPage<BrewingBatch>> page(@RequestParam(defaultValue = "1") Integer pageNum,
                                            @RequestParam(defaultValue = "10") Integer pageSize,
                                            @RequestParam(required = false) String keyword,
                                            @RequestParam(required = false) String batchStatus,
                                            @RequestParam(required = false) String qualityStatus) {
        LambdaQueryWrapper<BrewingBatch> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(BrewingBatch::getBatchNo, keyword)
                    .or().like(BrewingBatch::getBatchName, keyword);
        }
        if (StringUtils.hasText(batchStatus)) {
            wrapper.eq(BrewingBatch::getBatchStatus, batchStatus);
        }
        if (StringUtils.hasText(qualityStatus)) {
            wrapper.eq(BrewingBatch::getQualityStatus, qualityStatus);
        }
        wrapper.orderByDesc(BrewingBatch::getCreateTime);
        return Result.success(brewingBatchService.page(new Page<>(pageNum, pageSize), wrapper));
    }

    @GetMapping("/{id}")
    public Result<BatchDTO> getDetailById(@PathVariable Long id) {
        return Result.success(brewingBatchService.getBatchDetailById(id));
    }

    @GetMapping("/no/{batchNo}")
    public Result<BrewingBatch> getByBatchNo(@PathVariable String batchNo) {
        LambdaQueryWrapper<BrewingBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BrewingBatch::getBatchNo, batchNo);
        return Result.success(brewingBatchService.getOne(wrapper));
    }

    @PostMapping
    public Result<BrewingBatch> add(@RequestBody BatchDTO batchDTO) {
        BrewingBatch batch = brewingBatchService.createBatch(batchDTO);
        return Result.success(batch);
    }

    @PutMapping
    public Result<Void> update(@RequestBody BrewingBatch batch) {
        brewingBatchService.updateBatchSimple(batch);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        brewingBatchService.removeById(id);
        return Result.success();
    }

    @GetMapping("/trace/material/{materialId}")
    public Result<List<BrewingBatch>> traceByMaterial(@PathVariable Long materialId) {
        return Result.success(brewingBatchService.traceByMaterial(materialId));
    }

    @GetMapping("/trace/process/{processTypeId}")
    public Result<List<BrewingBatch>> traceByProcess(@PathVariable Long processTypeId) {
        return Result.success(brewingBatchService.traceByProcess(processTypeId));
    }

    @PostMapping("/trace")
    public Result<IPage<BrewingBatch>> traceBatch(@RequestBody TraceabilityQueryDTO queryDTO) {
        return Result.success(brewingBatchService.traceBatch(queryDTO));
    }
}
