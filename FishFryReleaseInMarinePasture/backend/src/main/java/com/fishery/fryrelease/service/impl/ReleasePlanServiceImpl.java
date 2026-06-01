package com.fishery.fryrelease.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.entity.RecaptureRecord;
import com.fishery.fryrelease.entity.ReleasePlan;
import com.fishery.fryrelease.entity.ReleaseRecord;
import com.fishery.fryrelease.mapper.RecaptureRecordMapper;
import com.fishery.fryrelease.mapper.ReleasePlanMapper;
import com.fishery.fryrelease.mapper.ReleaseRecordMapper;
import com.fishery.fryrelease.service.ReleasePlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReleasePlanServiceImpl implements ReleasePlanService {

    @Autowired
    private ReleasePlanMapper releasePlanMapper;

    @Autowired
    private ReleaseRecordMapper releaseRecordMapper;

    @Autowired
    private RecaptureRecordMapper recaptureRecordMapper;

    @Override
    public PageResult<ReleasePlan> getPage(PageRequest pageRequest, Long areaId, Long speciesId, Integer planYear, String status) {
        Page<ReleasePlan> page = new Page<>(pageRequest.getPage(), pageRequest.getSize());
        IPage<ReleasePlan> result = releasePlanMapper.selectPlanPage(page, areaId, speciesId, planYear, status);
        return new PageResult<>(result.getRecords(), result.getTotal(), pageRequest.getPage(), pageRequest.getSize());
    }

    @Override
    public ReleasePlan getById(Long id) {
        return releasePlanMapper.selectById(id);
    }

    @Override
    public void save(ReleasePlan releasePlan) {
        releasePlanMapper.insert(releasePlan);
    }

    @Override
    public void updateById(ReleasePlan releasePlan) {
        releasePlanMapper.updateById(releasePlan);
    }

    @Override
    public void removeById(Long id) {
        releasePlanMapper.deleteById(id);
    }

    @Override
    public List<Map<String, Object>> getProgress() {
        LambdaQueryWrapper<ReleasePlan> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ReleasePlan::getPlanYear, LocalDateTime.now().getYear());
        List<ReleasePlan> plans = releasePlanMapper.selectList(wrapper);

        List<Map<String, Object>> result = new ArrayList<>();
        for (ReleasePlan plan : plans) {
            Map<String, Object> item = new HashMap<>();
            item.put("planId", plan.getId());
            item.put("areaName", plan.getAreaName());
            item.put("speciesName", plan.getSpeciesName());
            item.put("planQuantity", plan.getPlanQuantity());

            LambdaQueryWrapper<ReleaseRecord> recordWrapper = new LambdaQueryWrapper<>();
            recordWrapper.eq(ReleaseRecord::getPlanId, plan.getId());
            List<ReleaseRecord> records = releaseRecordMapper.selectList(recordWrapper);
            long actualTotal = records.stream().mapToLong(ReleaseRecord::getActualQuantity).sum();

            item.put("actualQuantity", actualTotal);
            BigDecimal rate = plan.getPlanQuantity() > 0
                    ? BigDecimal.valueOf(actualTotal).multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(plan.getPlanQuantity()), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            item.put("completionRate", rate);
            result.add(item);
        }
        return result;
    }
}
