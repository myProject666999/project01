package com.fishery.fryrelease.service;

import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.entity.ReleasePlan;

import java.util.List;
import java.util.Map;

public interface ReleasePlanService {
    PageResult<ReleasePlan> getPage(PageRequest pageRequest, Long areaId, Long speciesId, Integer planYear, String status);

    ReleasePlan getById(Long id);

    void save(ReleasePlan releasePlan);

    void updateById(ReleasePlan releasePlan);

    void removeById(Long id);

    List<Map<String, Object>> getProgress();
}
