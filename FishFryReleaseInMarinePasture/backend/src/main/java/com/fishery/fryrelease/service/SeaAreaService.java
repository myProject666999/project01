package com.fishery.fryrelease.service;

import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.entity.SeaArea;

public interface SeaAreaService {
    PageResult<SeaArea> getPage(PageRequest pageRequest, String keyword);

    SeaArea getById(Long id);

    void save(SeaArea seaArea);

    void updateById(SeaArea seaArea);

    void removeById(Long id);
}
