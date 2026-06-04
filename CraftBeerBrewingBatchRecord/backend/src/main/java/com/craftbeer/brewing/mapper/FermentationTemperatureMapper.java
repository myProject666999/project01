package com.craftbeer.brewing.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.craftbeer.brewing.entity.FermentationTemperature;
import org.apache.ibatis.annotations.Mapper;

/**
 * 发酵温度记录Mapper接口
 */
@Mapper
public interface FermentationTemperatureMapper extends BaseMapper<FermentationTemperature> {
}
