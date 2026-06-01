package com.fishery.fryrelease.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.entity.Species;
import com.fishery.fryrelease.mapper.SpeciesMapper;
import com.fishery.fryrelease.service.SpeciesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpeciesServiceImpl implements SpeciesService {

    @Autowired
    private SpeciesMapper speciesMapper;

    @Override
    public PageResult<Species> getPage(PageRequest pageRequest, String keyword, String category) {
        Page<Species> page = new Page<>(pageRequest.getPage(), pageRequest.getSize());
        IPage<Species> result = speciesMapper.selectPage(page, keyword, category);
        return new PageResult<>(result.getRecords(), result.getTotal(), pageRequest.getPage(), pageRequest.getSize());
    }

    @Override
    public List<Species> listAll() {
        LambdaQueryWrapper<Species> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Species::getStatus, 1);
        return speciesMapper.selectList(wrapper);
    }

    @Override
    public Species getById(Long id) {
        return speciesMapper.selectById(id);
    }

    @Override
    public void save(Species species) {
        speciesMapper.insert(species);
    }

    @Override
    public void updateById(Species species) {
        speciesMapper.updateById(species);
    }

    @Override
    public void removeById(Long id) {
        speciesMapper.deleteById(id);
    }
}
