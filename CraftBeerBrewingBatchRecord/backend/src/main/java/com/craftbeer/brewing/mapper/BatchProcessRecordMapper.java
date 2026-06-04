package com.craftbeer.brewing.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.craftbeer.brewing.entity.BatchProcessRecord;
import org.apache.ibatis.annotations.Mapper;

/**
 * 批次工序记录Mapper接口
 */
@Mapper
public interface BatchProcessRecordMapper extends BaseMapper<BatchProcessRecord> {
}
