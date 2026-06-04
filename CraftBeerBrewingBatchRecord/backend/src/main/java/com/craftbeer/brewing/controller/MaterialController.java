package com.craftbeer.brewing.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.craftbeer.brewing.common.Result;
import com.craftbeer.brewing.entity.Material;
import com.craftbeer.brewing.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 原料Controller
 */
@RestController
@RequestMapping("/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    public Result<List<Material>> list() {
        return Result.success(materialService.list());
    }

    @GetMapping("/page")
    public Result<IPage<Material>> page(@RequestParam(defaultValue = "1") Integer pageNum,
                                        @RequestParam(defaultValue = "10") Integer pageSize,
                                        @RequestParam(required = false) String keyword,
                                        @RequestParam(required = false) Long materialTypeId) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Material::getMaterialName, keyword)
                    .or().like(Material::getMaterialCode, keyword);
        }
        if (materialTypeId != null) {
            wrapper.eq(Material::getMaterialTypeId, materialTypeId);
        }
        wrapper.orderByDesc(Material::getCreateTime);
        return Result.success(materialService.page(new Page<>(pageNum, pageSize), wrapper));
    }

    @GetMapping("/by-type/{materialTypeId}")
    public Result<List<Material>> getByTypeId(@PathVariable Long materialTypeId) {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getMaterialTypeId, materialTypeId)
                .orderByDesc(Material::getCreateTime);
        return Result.success(materialService.list(wrapper));
    }

    @GetMapping("/{id}")
    public Result<Material> getById(@PathVariable Long id) {
        return Result.success(materialService.getById(id));
    }

    @PostMapping
    public Result<Material> add(@RequestBody Material material) {
        materialService.save(material);
        return Result.success(material);
    }

    @PutMapping
    public Result<Void> update(@RequestBody Material material) {
        materialService.updateById(material);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        materialService.removeById(id);
        return Result.success();
    }
}
