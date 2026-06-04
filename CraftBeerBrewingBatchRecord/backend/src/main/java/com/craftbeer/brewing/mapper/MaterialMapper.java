package com.craftbeer.brewing.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.craftbeer.brewing.entity.Material;
import org.apache.ibatis.annotations.Mapper;

/**
 * 原料Mapper接口
 */
@Mapper
public interface MaterialMapper extends BaseMapper<Material> {
}
