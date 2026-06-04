package com.craftbeer.brewing.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.craftbeer.brewing.entity.BatchTraceability;
import org.apache.ibatis.annotations.Mapper;

/**
 * 批次追溯Mapper接口
 */
@Mapper
public interface BatchTraceabilityMapper extends BaseMapper<BatchTraceability> {
}
