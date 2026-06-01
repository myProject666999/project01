package com.fishery.fryrelease.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fishery.fryrelease.entity.WaterQuality;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

public interface WaterQualityMapper extends BaseMapper<WaterQuality> {
    IPage<WaterQuality> selectQualityPage(Page<WaterQuality> page,
                                           @Param("areaId") Long areaId,
                                           @Param("startDate") String startDate,
                                           @Param("endDate") String endDate);

    List<Map<String, Object>> selectTrend(@Param("areaId") Long areaId,
                                           @Param("startDate") String startDate,
                                           @Param("endDate") String endDate);

    List<WaterQuality> selectWarnings();
}
