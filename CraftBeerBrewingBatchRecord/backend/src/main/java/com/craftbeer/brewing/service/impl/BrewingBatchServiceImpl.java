package com.craftbeer.brewing.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.craftbeer.brewing.dto.BatchDTO;
import com.craftbeer.brewing.dto.TraceabilityQueryDTO;
import com.craftbeer.brewing.entity.BatchProcessRecord;
import com.craftbeer.brewing.entity.BrewingBatch;
import com.craftbeer.brewing.entity.RecipeMaterial;
import com.craftbeer.brewing.exception.BusinessException;
import com.craftbeer.brewing.mapper.BatchProcessRecordMapper;
import com.craftbeer.brewing.mapper.BrewingBatchMapper;
import com.craftbeer.brewing.mapper.RecipeMaterialMapper;
import com.craftbeer.brewing.service.BrewingBatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 酿造批次Service实现类
 */
@Service
@RequiredArgsConstructor
public class BrewingBatchServiceImpl extends ServiceImpl<BrewingBatchMapper, BrewingBatch> implements BrewingBatchService {

    private final BatchProcessRecordMapper batchProcessRecordMapper;
    private final RecipeMaterialMapper recipeMaterialMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BrewingBatch createBatch(BatchDTO batchDTO) {
        BrewingBatch batch = batchDTO.getBatch();
        List<BatchProcessRecord> processRecords = batchDTO.getProcessRecords();

        LambdaQueryWrapper<BrewingBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BrewingBatch::getBatchNo, batch.getBatchNo());
        if (count(wrapper) > 0) {
            throw new BusinessException("批次号已存在");
        }

        batch.setId(null);
        batch.setCreateTime(LocalDateTime.now());
        batch.setUpdateTime(LocalDateTime.now());
        save(batch);

        if (processRecords != null && !processRecords.isEmpty()) {
            for (BatchProcessRecord record : processRecords) {
                record.setId(null);
                record.setBatchId(batch.getId());
                record.setCreateTime(LocalDateTime.now());
                record.setUpdateTime(LocalDateTime.now());
                batchProcessRecordMapper.insert(record);
            }
        }

        return batch;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateBatch(BatchDTO batchDTO) {
        BrewingBatch batch = batchDTO.getBatch();
        List<BatchProcessRecord> processRecords = batchDTO.getProcessRecords();

        if (getById(batch.getId()) == null) {
            throw new BusinessException("批次不存在");
        }

        batch.setUpdateTime(LocalDateTime.now());
        boolean result = updateById(batch);

        if (processRecords != null && !processRecords.isEmpty()) {
            LambdaQueryWrapper<BatchProcessRecord> deleteWrapper = new LambdaQueryWrapper<>();
            deleteWrapper.eq(BatchProcessRecord::getBatchId, batch.getId());
            batchProcessRecordMapper.delete(deleteWrapper);

            for (BatchProcessRecord record : processRecords) {
                record.setId(null);
                record.setBatchId(batch.getId());
                record.setCreateTime(LocalDateTime.now());
                record.setUpdateTime(LocalDateTime.now());
                batchProcessRecordMapper.insert(record);
            }
        }

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateBatchSimple(BrewingBatch batch) {
        if (getById(batch.getId()) == null) {
            throw new BusinessException("批次不存在");
        }
        batch.setUpdateTime(LocalDateTime.now());
        return updateById(batch);
    }

    @Override
    public BatchDTO getBatchDetailById(Long id) {
        BrewingBatch batch = getById(id);
        if (batch == null) {
            throw new BusinessException("批次不存在");
        }

        LambdaQueryWrapper<BatchProcessRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BatchProcessRecord::getBatchId, id)
                .orderByAsc(BatchProcessRecord::getStartTime);
        List<BatchProcessRecord> processRecords = batchProcessRecordMapper.selectList(wrapper);

        BatchDTO batchDTO = new BatchDTO();
        batchDTO.setBatch(batch);
        batchDTO.setProcessRecords(processRecords);
        return batchDTO;
    }

    @Override
    public List<BrewingBatch> traceByMaterial(Long materialId) {
        LambdaQueryWrapper<RecipeMaterial> rmWrapper = new LambdaQueryWrapper<>();
        rmWrapper.eq(RecipeMaterial::getMaterialId, materialId);
        List<RecipeMaterial> recipeMaterials = recipeMaterialMapper.selectList(rmWrapper);

        List<Long> recipeIds = recipeMaterials.stream()
                .map(RecipeMaterial::getRecipeId)
                .distinct()
                .collect(Collectors.toList());

        if (recipeIds.isEmpty()) {
            return Collections.emptyList();
        }

        LambdaQueryWrapper<BrewingBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(BrewingBatch::getRecipeId, recipeIds)
                .eq(BrewingBatch::getQualityStatus, "FAILED")
                .orderByDesc(BrewingBatch::getCreateTime);
        return list(wrapper);
    }

    @Override
    public List<BrewingBatch> traceByProcess(Long processTypeId) {
        LambdaQueryWrapper<BatchProcessRecord> prWrapper = new LambdaQueryWrapper<>();
        prWrapper.eq(BatchProcessRecord::getProcessTypeId, processTypeId);
        List<BatchProcessRecord> processRecords = batchProcessRecordMapper.selectList(prWrapper);

        List<Long> batchIds = processRecords.stream()
                .map(BatchProcessRecord::getBatchId)
                .distinct()
                .collect(Collectors.toList());

        if (batchIds.isEmpty()) {
            return Collections.emptyList();
        }

        LambdaQueryWrapper<BrewingBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(BrewingBatch::getId, batchIds)
                .eq(BrewingBatch::getQualityStatus, "FAILED")
                .orderByDesc(BrewingBatch::getCreateTime);
        return list(wrapper);
    }

    @Override
    public IPage<BrewingBatch> traceBatch(TraceabilityQueryDTO queryDTO) {
        LambdaQueryWrapper<BrewingBatch> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getBatchId() != null) {
            wrapper.eq(BrewingBatch::getId, queryDTO.getBatchId());
        }
        if (StringUtils.hasText(queryDTO.getBatchNo())) {
            wrapper.like(BrewingBatch::getBatchNo, queryDTO.getBatchNo());
        }
        if (StringUtils.hasText(queryDTO.getQualityStatus())) {
            wrapper.eq(BrewingBatch::getQualityStatus, queryDTO.getQualityStatus());
        }
        if (queryDTO.getStartTime() != null) {
            wrapper.ge(BrewingBatch::getStartTime, queryDTO.getStartTime());
        }
        if (queryDTO.getEndTime() != null) {
            wrapper.le(BrewingBatch::getEndTime, queryDTO.getEndTime());
        }
        if (queryDTO.getMaterialId() != null) {
            List<Long> recipeIds = getRecipeIdsByMaterialId(queryDTO.getMaterialId());
            if (!recipeIds.isEmpty()) {
                wrapper.in(BrewingBatch::getRecipeId, recipeIds);
            }
        }

        wrapper.orderByDesc(BrewingBatch::getCreateTime);
        return page(new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize()), wrapper);
    }

    private List<Long> getRecipeIdsByMaterialId(Long materialId) {
        LambdaQueryWrapper<RecipeMaterial> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RecipeMaterial::getMaterialId, materialId);
        List<RecipeMaterial> recipeMaterials = recipeMaterialMapper.selectList(wrapper);
        return recipeMaterials.stream()
                .map(RecipeMaterial::getRecipeId)
                .distinct()
                .collect(Collectors.toList());
    }
}
