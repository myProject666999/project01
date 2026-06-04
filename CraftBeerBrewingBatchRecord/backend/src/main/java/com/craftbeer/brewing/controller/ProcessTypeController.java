package com.craftbeer.brewing.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.craftbeer.brewing.common.Result;
import com.craftbeer.brewing.entity.ProcessType;
import com.craftbeer.brewing.service.ProcessTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 工序类型Controller
 */
@RestController
@RequestMapping("/process-types")
@RequiredArgsConstructor
public class ProcessTypeController {

    private final ProcessTypeService processTypeService;

    @GetMapping
    public Result<List<ProcessType>> list() {
        LambdaQueryWrapper<ProcessType> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(ProcessType::getProcessOrder);
        return Result.success(processTypeService.list(wrapper));
    }

    @GetMapping("/{id}")
    public Result<ProcessType> getById(@PathVariable Long id) {
        return Result.success(processTypeService.getById(id));
    }

    @GetMapping("/code/{processCode}")
    public Result<ProcessType> getByCode(@PathVariable String processCode) {
        LambdaQueryWrapper<ProcessType> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProcessType::getProcessCode, processCode);
        return Result.success(processTypeService.getOne(wrapper));
    }

    @PostMapping
    public Result<ProcessType> add(@RequestBody ProcessType processType) {
        processTypeService.save(processType);
        return Result.success(processType);
    }

    @PutMapping
    public Result<Void> update(@RequestBody ProcessType processType) {
        processTypeService.updateById(processType);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        processTypeService.removeById(id);
        return Result.success();
    }
}
