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

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Recipe createNewVersionSimple(Recipe recipe) {
        Recipe sourceRecipe = null;
        if (recipe.getId() != null) {
            sourceRecipe = getById(recipe.getId());
        }
        if (sourceRecipe == null && recipe.getRecipeCode() != null) {
            sourceRecipe = getLatestVersion(recipe.getRecipeCode());
        }
        if (sourceRecipe == null) {
            throw new BusinessException("找不到原配方");
        }

        int newVersion = sourceRecipe.getVersion() + 1;

        Recipe newRecipe = new Recipe();
        newRecipe.setRecipeName(recipe.getRecipeName() != null ? recipe.getRecipeName() : sourceRecipe.getRecipeName());
        newRecipe.setRecipeCode(sourceRecipe.getRecipeCode());
        newRecipe.setVersion(newVersion);
        newRecipe.setParentRecipeId(sourceRecipe.getId());
        newRecipe.setBeerStyle(recipe.getBeerStyle() != null ? recipe.getBeerStyle() : sourceRecipe.getBeerStyle());
        newRecipe.setTargetIbu(recipe.getTargetIbu() != null ? recipe.getTargetIbu() : sourceRecipe.getTargetIbu());
        newRecipe.setTargetAbv(recipe.getTargetAbv() != null ? recipe.getTargetAbv() : sourceRecipe.getTargetAbv());
        newRecipe.setTargetOg(recipe.getTargetOg() != null ? recipe.getTargetOg() : sourceRecipe.getTargetOg());
        newRecipe.setTargetFg(recipe.getTargetFg() != null ? recipe.getTargetFg() : sourceRecipe.getTargetFg());
        newRecipe.setBatchSizeLiters(recipe.getBatchSizeLiters() != null ? recipe.getBatchSizeLiters() : sourceRecipe.getBatchSizeLiters());
        newRecipe.setDescription(recipe.getDescription() != null ? recipe.getDescription() : sourceRecipe.getDescription());
        newRecipe.setCreateTime(LocalDateTime.now());
        newRecipe.setUpdateTime(LocalDateTime.now());
        save(newRecipe);

        LambdaQueryWrapper<RecipeMaterial> materialWrapper = new LambdaQueryWrapper<>();
        materialWrapper.eq(RecipeMaterial::getRecipeId, sourceRecipe.getId());
        List<RecipeMaterial> materialList = recipeMaterialMapper.selectList(materialWrapper);

        for (RecipeMaterial material : materialList) {
            RecipeMaterial newMaterial = new RecipeMaterial();
            newMaterial.setRecipeId(newRecipe.getId());
            newMaterial.setMaterialId(material.getMaterialId());
            newMaterial.setMaterialTypeId(material.getMaterialTypeId());
            newMaterial.setUsageAmount(material.getUsageAmount());
            newMaterial.setUsageUnit(material.getUsageUnit());
            newMaterial.setAddTiming(material.getAddTiming());
            newMaterial.setAddOrder(material.getAddOrder());
            newMaterial.setNotes(material.getNotes());
            newMaterial.setCreateTime(LocalDateTime.now());
            recipeMaterialMapper.insert(newMaterial);
        }

        return newRecipe;
    }
}
