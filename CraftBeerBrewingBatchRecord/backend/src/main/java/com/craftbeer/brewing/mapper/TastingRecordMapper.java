package com.craftbeer.brewing.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.craftbeer.brewing.entity.TastingRecord;
import org.apache.ibatis.annotations.Mapper;

/**
 * 品测记录Mapper接口
 */
@Mapper
public interface TastingRecordMapper extends BaseMapper<TastingRecord> {
}
