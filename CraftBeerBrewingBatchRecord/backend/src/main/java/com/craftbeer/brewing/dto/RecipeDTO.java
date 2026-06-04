package com.craftbeer.brewing.dto;

import com.craftbeer.brewing.entity.Recipe;
import com.craftbeer.brewing.entity.RecipeMaterial;
import lombok.Data;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * 配方DTO（包含配方信息和原料列表）
 */
@Data
public class RecipeDTO {

    @NotNull(message = "配方信息不能为空")
    @Valid
    private Recipe recipe;

    @NotEmpty(message = "配方原料列表不能为空")
    @Valid
    private List<RecipeMaterial> materialList;
}
