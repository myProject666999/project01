package com.fishery.fryrelease.service;

import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.entity.Species;

import java.util.List;

public interface SpeciesService {
    PageResult<Species> getPage(PageRequest pageRequest, String keyword, String category);

    List<Species> listAll();

    Species getById(Long id);

    void save(Species species);

    void updateById(Species species);

    void removeById(Long id);
}
