package com.aics.quality.service;

import com.aics.quality.common.PageQuery;
import com.aics.quality.common.PageResult;
import com.aics.quality.entity.ViolationRecord;
import com.aics.quality.mapper.ViolationRecordMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ViolationRecordService {

    @Autowired
    private ViolationRecordMapper violationRecordMapper;

    public PageResult<ViolationRecord> list(PageQuery pageQuery, String keyword, Integer status, Integer violationLevel) {
        LambdaQueryWrapper<ViolationRecord> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(ViolationRecord::getCsName, keyword)
                    .or().like(ViolationRecord::getViolationNo, keyword);
        }
        if (status != null) {
            wrapper.eq(ViolationRecord::getStatus, status);
        }
        if (violationLevel != null) {
            wrapper.eq(ViolationRecord::getViolationLevel, violationLevel);
        }
        wrapper.orderByDesc(ViolationRecord::getCreateTime);

        Page<ViolationRecord> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        violationRecordMapper.selectPage(page, wrapper);

        return PageResult.of(page.getTotal(), page.getRecords(), pageQuery.getPageNum(), pageQuery.getPageSize());
    }

    public ViolationRecord getById(Long id) {
        return violationRecordMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean confirm(Long id, String confirmBy) {
        ViolationRecord record = violationRecordMapper.selectById(id);
        if (record == null) {
            return false;
        }
        record.setStatus(2);
        record.setConfirmTime(LocalDateTime.now());
        record.setConfirmBy(confirmBy);
        return violationRecordMapper.updateById(record) > 0;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean revoke(Long id) {
        ViolationRecord record = violationRecordMapper.selectById(id);
        if (record == null) {
            return false;
        }
        record.setStatus(4);
        return violationRecordMapper.updateById(record) > 0;
    }
}
