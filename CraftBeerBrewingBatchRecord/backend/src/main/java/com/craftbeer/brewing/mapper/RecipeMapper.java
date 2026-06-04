package com.craftbeer.brewing.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.craftbeer.brewing.entity.Recipe;
import org.apache.ibatis.annotations.Mapper;

/**
 * 配方Mapper接口
 */
@Mapper
public interface RecipeMapper extends BaseMapper<Recipe> {
}
