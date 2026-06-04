package com.craftbeer.brewing.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.craftbeer.brewing.dto.RecipeDTO;
import com.craftbeer.brewing.entity.Recipe;
import com.craftbeer.brewing.entity.RecipeMaterial;
import com.craftbeer.brewing.exception.BusinessException;
import com.craftbeer.brewing.mapper.RecipeMapper;
import com.craftbeer.brewing.mapper.RecipeMaterialMapper;
import com.craftbeer.brewing.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 配方Service实现类
 */
@Service
@RequiredArgsConstructor
public class RecipeServiceImpl extends ServiceImpl<RecipeMapper, Recipe> implements RecipeService {

    private final RecipeMaterialMapper recipeMaterialMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Recipe createNewVersion(RecipeDTO recipeDTO) {
        Recipe recipe = recipeDTO.getRecipe();
        List<RecipeMaterial> materialList = recipeDTO.getMaterialList();

        Recipe latestVersion = getLatestVersion(recipe.getRecipeCode());
        int newVersion = latestVersion != null ? latestVersion.getVersion() + 1 : 1;

        recipe.setId(null);
        recipe.setVersion(newVersion);
        recipe.setParentRecipeId(latestVersion != null ? latestVersion.getId() : null);
        recipe.setCreateTime(LocalDateTime.now());
        recipe.setUpdateTime(LocalDateTime.now());
        save(recipe);

        for (RecipeMaterial material : materialList) {
            material.setId(null);
            material.setRecipeId(recipe.getId());
            material.setCreateTime(LocalDateTime.now());
            recipeMaterialMapper.insert(material);
        }

        return recipe;
    }

    @Override
    public List<Recipe> getRecipeHistory(String recipeCode) {
        LambdaQueryWrapper<Recipe> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Recipe::getRecipeCode, recipeCode)
                .orderByDesc(Recipe::getVersion);
        return list(wrapper);
    }

    @Override
    public RecipeDTO getRecipeDetailById(Long id) {
        Recipe recipe = getById(id);
        if (recipe == null) {
            throw new BusinessException("配方不存在");
        }

        LambdaQueryWrapper<RecipeMaterial> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RecipeMaterial::getRecipeId, id)
                .orderByAsc(RecipeMaterial::getAddOrder);
        List<RecipeMaterial> materialList = recipeMaterialMapper.selectList(wrapper);

        RecipeDTO recipeDTO = new RecipeDTO();
        recipeDTO.setRecipe(recipe);
        recipeDTO.setMaterialList(materialList);
        return recipeDTO;
    }

    @Override
    public Recipe getLatestVersion(String recipeCode) {
        LambdaQueryWrapper<Recipe> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Recipe::getRecipeCode, recipeCode)
                .orderByDesc(Recipe::getVersion)
                .last("LIMIT 1");
        return getOne(wrapper);
    }
}
