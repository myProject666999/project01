package com.monitoring.wastewater.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.monitoring.wastewater.entity.MonitorData;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MonitorDataMapper extends BaseMapper<MonitorData> {
}
