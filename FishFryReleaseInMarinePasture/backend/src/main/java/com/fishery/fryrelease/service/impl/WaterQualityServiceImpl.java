package com.fishery.fryrelease.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.entity.WaterQuality;
import com.fishery.fryrelease.mapper.WaterQualityMapper;
import com.fishery.fryrelease.service.WaterQualityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class WaterQualityServiceImpl implements WaterQualityService {

    @Autowired
    private WaterQualityMapper waterQualityMapper;

    @Override
    public PageResult<WaterQuality> getPage(PageRequest pageRequest, Long areaId, String startDate, String endDate) {
        Page<WaterQuality> page = new Page<>(pageRequest.getPage(), pageRequest.getSize());
        IPage<WaterQuality> result = waterQualityMapper.selectQualityPage(page, areaId, startDate, endDate);
        return new PageResult<>(result.getRecords(), result.getTotal(), pageRequest.getPage(), pageRequest.getSize());
    }

    @Override
    public WaterQuality getById(Long id) {
        return waterQualityMapper.selectById(id);
    }

    @Override
    public void save(WaterQuality waterQuality) {
        waterQualityMapper.insert(waterQuality);
    }

    @Override
    public void updateById(WaterQuality waterQuality) {
        waterQualityMapper.updateById(waterQuality);
    }

    @Override
    public void removeById(Long id) {
        waterQualityMapper.deleteById(id);
    }

    @Override
    public List<Map<String, Object>> getTrend(Long areaId, String startDate, String endDate) {
        return waterQualityMapper.selectTrend(areaId, startDate, endDate);
    }

    @Override
    public List<WaterQuality> getWarnings() {
        return waterQualityMapper.selectWarnings();
    }
}
