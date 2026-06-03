package com.monitoring.wastewater.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.monitoring.wastewater.entity.AlarmRecord;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AlarmRecordMapper extends BaseMapper<AlarmRecord> {
}
