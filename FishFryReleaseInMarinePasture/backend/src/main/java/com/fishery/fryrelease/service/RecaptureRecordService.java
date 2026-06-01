package com.fishery.fryrelease.service;

import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.entity.RecaptureRecord;

import java.util.List;
import java.util.Map;

public interface RecaptureRecordService {
    PageResult<RecaptureRecord> getPage(PageRequest pageRequest, Long areaId, Long speciesId, String startDate, String endDate);

    RecaptureRecord getById(Long id);

    void save(RecaptureRecord recaptureRecord);

    void updateById(RecaptureRecord recaptureRecord);

    void removeById(Long id);

    List<Map<String, Object>> getAnalysis(Integer year, Long areaId, Long speciesId);

    List<Map<String, Object>> getTrend(Integer year);
}
