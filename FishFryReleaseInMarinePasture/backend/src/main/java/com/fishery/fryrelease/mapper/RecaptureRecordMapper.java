package com.fishery.fryrelease.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fishery.fryrelease.entity.RecaptureRecord;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

public interface RecaptureRecordMapper extends BaseMapper<RecaptureRecord> {
    IPage<RecaptureRecord> selectRecapturePage(Page<RecaptureRecord> page,
                                                @Param("areaId") Long areaId,
                                                @Param("speciesId") Long speciesId,
                                                @Param("startDate") String startDate,
                                                @Param("endDate") String endDate);

    List<Map<String, Object>> selectReleaseQuantityBySpecies(@Param("year") Integer year, @Param("areaId") Long areaId, @Param("speciesId") Long speciesId);

    List<Map<String, Object>> selectRecaptureTotalsBySpecies(@Param("year") Integer year, @Param("areaId") Long areaId, @Param("speciesId") Long speciesId);

    List<Map<String, Object>> selectMonthlyTrend(@Param("year") Integer year);
}
