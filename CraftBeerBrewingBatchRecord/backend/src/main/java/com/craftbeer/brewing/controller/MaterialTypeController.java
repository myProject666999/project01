package com.craftbeer.brewing.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.craftbeer.brewing.common.Result;
import com.craftbeer.brewing.entity.MaterialType;
import com.craftbeer.brewing.service.MaterialTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 原料类型Controller
 */
@RestController
@RequestMapping("/material-types")
@RequiredArgsConstructor
public class MaterialTypeController {

    private final MaterialTypeService materialTypeService;

    @GetMapping
    public Result<List<MaterialType>> list() {
        return Result.success(materialTypeService.list());
    }

    @GetMapping("/page")
    public Result<IPage<MaterialType>> page(@RequestParam(defaultValue = "1") Integer pageNum,
                                            @RequestParam(defaultValue = "10") Integer pageSize) {
        LambdaQueryWrapper<MaterialType> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(MaterialType::getCreateTime);
        return Result.success(materialTypeService.page(new Page<>(pageNum, pageSize), wrapper));
    }

    @GetMapping("/{id}")
    public Result<MaterialType> getById(@PathVariable Long id) {
        return Result.success(materialTypeService.getById(id));
    }

    @PostMapping
    public Result<MaterialType> add(@RequestBody MaterialType materialType) {
        materialTypeService.save(materialType);
        return Result.success(materialType);
    }

    @PutMapping
    public Result<Void> update(@RequestBody MaterialType materialType) {
        materialTypeService.updateById(materialType);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        materialTypeService.removeById(id);
        return Result.success();
    }
}
