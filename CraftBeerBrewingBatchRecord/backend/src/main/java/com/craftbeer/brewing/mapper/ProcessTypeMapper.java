package com.craftbeer.brewing.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.craftbeer.brewing.entity.ProcessType;
import org.apache.ibatis.annotations.Mapper;

/**
 * 工序类型Mapper接口
 */
@Mapper
public interface ProcessTypeMapper extends BaseMapper<ProcessType> {
}
