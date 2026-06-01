package com.fishery.fryrelease.service;

import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.entity.ReleaseRecord;

public interface ReleaseRecordService {
    PageResult<ReleaseRecord> getPage(PageRequest pageRequest, Long areaId, Long speciesId, String startDate, String endDate);

    ReleaseRecord getById(Long id);

    void save(ReleaseRecord releaseRecord);

    void updateById(ReleaseRecord releaseRecord);

    void removeById(Long id);
}
