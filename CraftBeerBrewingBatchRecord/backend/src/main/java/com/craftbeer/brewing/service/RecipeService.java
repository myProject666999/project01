package com.craftbeer.brewing.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.craftbeer.brewing.dto.RecipeDTO;
import com.craftbeer.brewing.entity.Recipe;

import java.util.List;

/**
 * 配方Service接口
 */
public interface RecipeService extends IService<Recipe> {

    /**
     * 创建配方新版本
     */
    Recipe createNewVersion(RecipeDTO recipeDTO);

    /**
     * 查询配方历史版本
     */
    List<Recipe> getRecipeHistory(String recipeCode);

    /**
     * 根据ID获取配方详情（包含原料列表）
     */
    RecipeDTO getRecipeDetailById(Long id);

    /**
     * 获取配方最新版本
     */
    Recipe getLatestVersion(String recipeCode);
}
