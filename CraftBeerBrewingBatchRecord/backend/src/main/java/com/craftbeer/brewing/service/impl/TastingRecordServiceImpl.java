package com.craftbeer.brewing.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.craftbeer.brewing.entity.TastingRecord;
import com.craftbeer.brewing.mapper.TastingRecordMapper;
import com.craftbeer.brewing.service.TastingRecordService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 品测记录Service实现类
 */
@Service
public class TastingRecordServiceImpl extends ServiceImpl<TastingRecordMapper, TastingRecord> implements TastingRecordService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean addTastingRecord(TastingRecord tastingRecord) {
        tastingRecord.setId(null);
        tastingRecord.setCreateTime(LocalDateTime.now());
        return save(tastingRecord);
    }

    @Override
    public List<TastingRecord> getByBatchId(Long batchId) {
        LambdaQueryWrapper<TastingRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TastingRecord::getBatchId, batchId)
                .orderByDesc(TastingRecord::getTastingTime);
        return list(wrapper);
    }

    @Override
    public List<TastingRecord> getFailedRecords() {
        LambdaQueryWrapper<TastingRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TastingRecord::getFinalJudgment, "FAILED")
                .orderByDesc(TastingRecord::getTastingTime);
        return list(wrapper);
    }

    @Override
    public TastingRecord getAverageScores(Long batchId) {
        List<TastingRecord> records = getByBatchId(batchId);
        if (records == null || records.isEmpty()) {
            return null;
        }

        TastingRecord average = new TastingRecord();
        int count = records.size();
        BigDecimal appearanceSum = BigDecimal.ZERO;
        BigDecimal aromaSum = BigDecimal.ZERO;
        BigDecimal flavorSum = BigDecimal.ZERO;
        BigDecimal mouthfeelSum = BigDecimal.ZERO;
        BigDecimal overallSum = BigDecimal.ZERO;

        for (TastingRecord record : records) {
            if (record.getAppearanceScore() != null) {
                appearanceSum = appearanceSum.add(record.getAppearanceScore());
            }
            if (record.getAromaScore() != null) {
                aromaSum = aromaSum.add(record.getAromaScore());
            }
            if (record.getFlavorScore() != null) {
                flavorSum = flavorSum.add(record.getFlavorScore());
            }
            if (record.getMouthfeelScore() != null) {
                mouthfeelSum = mouthfeelSum.add(record.getMouthfeelScore());
            }
            if (record.getOverallScore() != null) {
                overallSum = overallSum.add(record.getOverallScore());
            }
        }

        average.setAppearanceScore(appearanceSum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP));
        average.setAromaScore(aromaSum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP));
        average.setFlavorScore(flavorSum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP));
        average.setMouthfeelScore(mouthfeelSum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP));
        average.setOverallScore(overallSum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP));

        return average;
    }
}
