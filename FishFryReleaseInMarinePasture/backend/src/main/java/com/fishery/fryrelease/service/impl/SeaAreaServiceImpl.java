package com.fishery.fryrelease.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.entity.SeaArea;
import com.fishery.fryrelease.mapper.SeaAreaMapper;
import com.fishery.fryrelease.service.SeaAreaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SeaAreaServiceImpl implements SeaAreaService {

    @Autowired
    private SeaAreaMapper seaAreaMapper;

    @Override
    public PageResult<SeaArea> getPage(PageRequest pageRequest, String keyword) {
        Page<SeaArea> page = new Page<>(pageRequest.getPage(), pageRequest.getSize());
        IPage<SeaArea> result = seaAreaMapper.selectPage(page, keyword);
        return new PageResult<>(result.getRecords(), result.getTotal(), pageRequest.getPage(), pageRequest.getSize());
    }

    @Override
    public SeaArea getById(Long id) {
        return seaAreaMapper.selectById(id);
    }

    @Override
    public void save(SeaArea seaArea) {
        seaAreaMapper.insert(seaArea);
    }

    @Override
    public void updateById(SeaArea seaArea) {
        seaAreaMapper.updateById(seaArea);
    }

    @Override
    public void removeById(Long id) {
        seaAreaMapper.deleteById(id);
    }
}
