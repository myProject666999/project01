package com.fishery.fryrelease.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.entity.ReleaseRecord;
import com.fishery.fryrelease.mapper.ReleaseRecordMapper;
import com.fishery.fryrelease.service.ReleaseRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReleaseRecordServiceImpl implements ReleaseRecordService {

    @Autowired
    private ReleaseRecordMapper releaseRecordMapper;

    @Override
    public PageResult<ReleaseRecord> getPage(PageRequest pageRequest, Long areaId, Long speciesId, String startDate, String endDate) {
        Page<ReleaseRecord> page = new Page<>(pageRequest.getPage(), pageRequest.getSize());
        IPage<ReleaseRecord> result = releaseRecordMapper.selectRecordPage(page, areaId, speciesId, startDate, endDate);
        return new PageResult<>(result.getRecords(), result.getTotal(), pageRequest.getPage(), pageRequest.getSize());
    }

    @Override
    public ReleaseRecord getById(Long id) {
        return releaseRecordMapper.selectById(id);
    }

    @Override
    public void save(ReleaseRecord releaseRecord) {
        releaseRecordMapper.insert(releaseRecord);
    }

    @Override
    public void updateById(ReleaseRecord releaseRecord) {
        releaseRecordMapper.updateById(releaseRecord);
    }

    @Override
    public void removeById(Long id) {
        releaseRecordMapper.deleteById(id);
    }
}
