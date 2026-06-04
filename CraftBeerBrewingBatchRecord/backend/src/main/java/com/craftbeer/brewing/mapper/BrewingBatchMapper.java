package com.craftbeer.brewing.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.craftbeer.brewing.entity.BrewingBatch;
import org.apache.ibatis.annotations.Mapper;

/**
 * 酿造批次Mapper接口
 */
@Mapper
public interface BrewingBatchMapper extends BaseMapper<BrewingBatch> {
}
