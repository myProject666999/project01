package com.craftbeer.brewing.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.craftbeer.brewing.common.Result;
import com.craftbeer.brewing.dto.RecipeDTO;
import com.craftbeer.brewing.entity.Recipe;
import com.craftbeer.brewing.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 配方Controller
 */
@RestController
@RequestMapping("/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public Result<List<Recipe>> list() {
        LambdaQueryWrapper<Recipe> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(Recipe::getCreateTime);
        return Result.success(recipeService.list(wrapper));
    }

    @GetMapping("/page")
    public Result<IPage<Recipe>> page(@RequestParam(defaultValue = "1") Integer pageNum,
                                      @RequestParam(defaultValue = "10") Integer pageSize,
                                      @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<Recipe> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Recipe::getRecipeName, keyword)
                    .or().like(Recipe::getRecipeCode, keyword);
        }
        wrapper.orderByDesc(Recipe::getCreateTime);
        return Result.success(recipeService.page(new Page<>(pageNum, pageSize), wrapper));
    }

    @GetMapping("/{id}")
    public Result<RecipeDTO> getDetailById(@PathVariable Long id) {
        return Result.success(recipeService.getRecipeDetailById(id));
    }

    @GetMapping("/code/{recipeCode}")
    public Result<Recipe> getByCode(@PathVariable String recipeCode) {
        LambdaQueryWrapper<Recipe> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Recipe::getRecipeCode, recipeCode)
                .orderByDesc(Recipe::getVersion)
                .last("LIMIT 1");
        return Result.success(recipeService.getOne(wrapper));
    }

    @GetMapping("/history/{recipeCode}")
    public Result<List<Recipe>> getHistory(@PathVariable String recipeCode) {
        return Result.success(recipeService.getRecipeHistory(recipeCode));
    }

    @GetMapping("/latest/{recipeCode}")
    public Result<Recipe> getLatestVersion(@PathVariable String recipeCode) {
        return Result.success(recipeService.getLatestVersion(recipeCode));
    }

    @PostMapping
    public Result<Recipe> add(@RequestBody RecipeDTO recipeDTO) {
        Recipe recipe = recipeService.createNewVersion(recipeDTO);
        return Result.success(recipe);
    }

    @PostMapping("/new-version")
    public Result<Recipe> createNewVersion(@RequestBody Recipe recipe) {
        Recipe newRecipe = recipeService.createNewVersionSimple(recipe);
        return Result.success("新版本创建成功", newRecipe);
    }

    @PutMapping
    public Result<Void> update(@RequestBody Recipe recipe) {
        recipeService.updateById(recipe);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        recipeService.removeById(id);
        return Result.success();
    }
}
