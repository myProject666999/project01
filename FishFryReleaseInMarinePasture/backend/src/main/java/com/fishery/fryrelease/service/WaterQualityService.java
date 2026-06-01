package com.fishery.fryrelease.service;

import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.entity.WaterQuality;

import java.util.List;
import java.util.Map;

public interface WaterQualityService {
    PageResult<WaterQuality> getPage(PageRequest pageRequest, Long areaId, String startDate, String endDate);

    WaterQuality getById(Long id);

    void save(WaterQuality waterQuality);

    void updateById(WaterQuality waterQuality);

    void removeById(Long id);

    List<Map<String, Object>> getTrend(Long areaId, String startDate, String endDate);

    List<WaterQuality> getWarnings();
}
