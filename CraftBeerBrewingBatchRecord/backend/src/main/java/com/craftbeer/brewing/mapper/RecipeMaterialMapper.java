package com.craftbeer.brewing.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.craftbeer.brewing.entity.RecipeMaterial;
import org.apache.ibatis.annotations.Mapper;

/**
 * 配方原料明细Mapper接口
 */
@Mapper
public interface RecipeMaterialMapper extends BaseMapper<RecipeMaterial> {
}
