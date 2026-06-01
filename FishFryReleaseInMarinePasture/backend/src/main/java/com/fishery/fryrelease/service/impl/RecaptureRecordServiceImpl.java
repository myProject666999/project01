package com.fishery.fryrelease.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fishery.fryrelease.common.PageRequest;
import com.fishery.fryrelease.common.PageResult;
import com.fishery.fryrelease.entity.RecaptureRecord;
import com.fishery.fryrelease.mapper.RecaptureRecordMapper;
import com.fishery.fryrelease.service.RecaptureRecordService;
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
public class RecaptureRecordServiceImpl implements RecaptureRecordService {

    @Autowired
    private RecaptureRecordMapper recaptureRecordMapper;

    @Override
    public PageResult<RecaptureRecord> getPage(PageRequest pageRequest, Long areaId, Long speciesId, String startDate, String endDate) {
        Page<RecaptureRecord> page = new Page<>(pageRequest.getPage(), pageRequest.getSize());
        IPage<RecaptureRecord> result = recaptureRecordMapper.selectRecapturePage(page, areaId, speciesId, startDate, endDate);
        return new PageResult<>(result.getRecords(), result.getTotal(), pageRequest.getPage(), pageRequest.getSize());
    }

    @Override
    public RecaptureRecord getById(Long id) {
        return recaptureRecordMapper.selectById(id);
    }

    @Override
    public void save(RecaptureRecord recaptureRecord) {
        recaptureRecordMapper.insert(recaptureRecord);
    }

    @Override
    public void updateById(RecaptureRecord recaptureRecord) {
        recaptureRecordMapper.updateById(recaptureRecord);
    }

    @Override
    public void removeById(Long id) {
        recaptureRecordMapper.deleteById(id);
    }

    @Override
    public List<Map<String, Object>> getAnalysis(Integer year, Long areaId, Long speciesId) {
        List<Map<String, Object>> releaseData = recaptureRecordMapper.selectReleaseQuantityBySpecies(year, areaId, speciesId);
        List<Map<String, Object>> recaptureData = recaptureRecordMapper.selectRecaptureTotalsBySpecies(year, areaId, speciesId);

        Map<Object, Map<String, Object>> recaptureMap = new HashMap<>();
        for (Map<String, Object> r : recaptureData) {
            recaptureMap.put(r.get("species_id"), r);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> release : releaseData) {
            Map<String, Object> item = new HashMap<>();
            Object speciesIdKey = release.get("species_id");
            item.put("speciesId", speciesIdKey);
            item.put("speciesName", release.get("species_name"));
            item.put("releaseQuantity", release.get("release_quantity"));

            Map<String, Object> recapture = recaptureMap.get(speciesIdKey);
            if (recapture != null) {
                BigDecimal catchWeight = recapture.get("total_weight") != null ? new BigDecimal(recapture.get("total_weight").toString()) : BigDecimal.ZERO;
                item.put("catchWeight", catchWeight);
                item.put("catchCount", recapture.get("total_count"));

                long releaseQty = Long.parseLong(release.get("release_quantity").toString());
                double timeCoefficient = calculateTimeCoefficient(year);
                BigDecimal rate = releaseQty > 0
                        ? catchWeight.multiply(BigDecimal.valueOf(timeCoefficient)).multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(releaseQty), 2, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;
                item.put("recaptureRate", rate);
            } else {
                item.put("catchWeight", BigDecimal.ZERO);
                item.put("catchCount", 0);
                item.put("recaptureRate", BigDecimal.ZERO);
            }
            result.add(item);
        }
        return result;
    }

    private double calculateTimeCoefficient(Integer year) {
        if (year == null) {
            return 1.0;
        }
        LocalDateTime releaseStart = LocalDateTime.of(year, 1, 1, 0, 0);
        long months = ChronoUnit.MONTHS.between(releaseStart, LocalDateTime.now());
        if (months <= 6) return 1.0;
        if (months <= 12) return 0.8;
        if (months <= 18) return 0.6;
        if (months <= 24) return 0.4;
        return 0.3;
    }

    @Override
    public List<Map<String, Object>> getTrend(Integer year) {
        return recaptureRecordMapper.selectMonthlyTrend(year);
    }
}
