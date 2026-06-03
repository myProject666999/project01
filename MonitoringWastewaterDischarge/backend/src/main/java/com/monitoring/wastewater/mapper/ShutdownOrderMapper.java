package com.monitoring.wastewater.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.monitoring.wastewater.entity.ShutdownOrder;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ShutdownOrderMapper extends BaseMapper<ShutdownOrder> {
}
