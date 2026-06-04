package com.craftbeer.brewing.service.impl;

import com.alibaba.fastjson2.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.craftbeer.brewing.dto.TraceabilityQueryDTO;
import com.craftbeer.brewing.entity.*;
import com.craftbeer.brewing.exception.BusinessException;
import com.craftbeer.brewing.mapper.*;
import com.craftbeer.brewing.service.BatchTraceabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 批次追溯Service实现类
 */
@Service
@RequiredArgsConstructor
public class BatchTraceabilityServiceImpl extends ServiceImpl<BatchTraceabilityMapper, BatchTraceability> implements BatchTraceabilityService {

    private final BrewingBatchMapper brewingBatchMapper;
    private final RecipeMapper recipeMapper;
    private final RecipeMaterialMapper recipeMaterialMapper;
    private final BatchProcessRecordMapper batchProcessRecordMapper;
    private final MaterialMapper materialMapper;
    private final ProcessTypeMapper processTypeMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BatchTraceability createTraceability(BatchTraceability traceability) {
        traceability.setId(null);
        traceability.setCreateTime(LocalDateTime.now());
        save(traceability);
        return traceability;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BatchTraceability analyzeTraceability(Long batchId, String traceType) {
        BrewingBatch batch = brewingBatchMapper.selectById(batchId);
        if (batch == null) {
            throw new BusinessException("批次不存在");
        }

        Map<String, Object> traceResult = new HashMap<>();

        if ("MATERIAL".equals(traceType) || "BOTH".equals(traceType)) {
            Map<String, Object> materialCheck = analyzeMaterials(batch.getRecipeId());
            traceResult.put("material_check", materialCheck);
        }

        if ("PROCESS".equals(traceType) || "BOTH".equals(traceType)) {
            Map<String, Object> processCheck = analyzeProcesses(batchId);
            traceResult.put("process_check", processCheck);
        }

        BatchTraceability traceability = new BatchTraceability();
        traceability.setBatchId(batchId);
        traceability.setTraceType(traceType);
        traceability.setTraceResult(JSON.toJSONString(traceResult));
        traceability.setTraceTime(LocalDateTime.now());
        traceability.setCreateTime(LocalDateTime.now());

        save(traceability);
        return traceability;
    }

    @Override
    public IPage<BatchTraceability> queryTraceability(TraceabilityQueryDTO queryDTO) {
        LambdaQueryWrapper<BatchTraceability> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getBatchId() != null) {
            wrapper.eq(BatchTraceability::getBatchId, queryDTO.getBatchId());
        }
        if (StringUtils.hasText(queryDTO.getTraceType())) {
            wrapper.eq(BatchTraceability::getTraceType, queryDTO.getTraceType());
        }
        if (StringUtils.hasText(queryDTO.getRootCauseCategory())) {
            wrapper.eq(BatchTraceability::getRootCauseCategory, queryDTO.getRootCauseCategory());
        }
        if (queryDTO.getStartTime() != null) {
            wrapper.ge(BatchTraceability::getTraceTime, queryDTO.getStartTime());
        }
        if (queryDTO.getEndTime() != null) {
            wrapper.le(BatchTraceability::getTraceTime, queryDTO.getEndTime());
        }

        wrapper.orderByDesc(BatchTraceability::getTraceTime);
        return page(new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize()), wrapper);
    }

    @Override
    public BatchTraceability getByBatchId(Long batchId) {
        LambdaQueryWrapper<BatchTraceability> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BatchTraceability::getBatchId, batchId)
                .orderByDesc(BatchTraceability::getTraceTime)
                .last("LIMIT 1");
        return getOne(wrapper);
    }

    private Map<String, Object> analyzeMaterials(Long recipeId) {
        Map<String, Object> result = new HashMap<>();

        LambdaQueryWrapper<RecipeMaterial> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RecipeMaterial::getRecipeId, recipeId);
        List<RecipeMaterial> recipeMaterials = recipeMaterialMapper.selectList(wrapper);

        for (RecipeMaterial rm : recipeMaterials) {
            Material material = materialMapper.selectById(rm.getMaterialId());
            if (material != null) {
                Map<String, Object> materialInfo = new HashMap<>();
                materialInfo.put("id", material.getId());
                materialInfo.put("name", material.getMaterialName());
                materialInfo.put("code", material.getMaterialCode());
                materialInfo.put("supplier", material.getSupplier());
                materialInfo.put("origin", material.getOrigin());
                materialInfo.put("specification", material.getSpecification());
                materialInfo.put("status", "normal");
                materialInfo.put("usage_amount", rm.getUsageAmount());
                materialInfo.put("usage_unit", rm.getUsageUnit());
                materialInfo.put("add_timing", rm.getAddTiming());
                result.put("material_" + material.getId(), materialInfo);
            }
        }

        return result;
    }

    private Map<String, Object> analyzeProcesses(Long batchId) {
        Map<String, Object> result = new HashMap<>();

        LambdaQueryWrapper<BatchProcessRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BatchProcessRecord::getBatchId, batchId)
                .orderByAsc(BatchProcessRecord::getStartTime);
        List<BatchProcessRecord> processRecords = batchProcessRecordMapper.selectList(wrapper);

        for (BatchProcessRecord record : processRecords) {
            ProcessType processType = processTypeMapper.selectById(record.getProcessTypeId());
            Map<String, Object> processInfo = new HashMap<>();
            processInfo.put("process_code", processType != null ? processType.getProcessCode() : "UNKNOWN");
            processInfo.put("process_name", processType != null ? processType.getProcessName() : "未知工序");
            processInfo.put("start_time", record.getStartTime());
            processInfo.put("end_time", record.getEndTime());
            processInfo.put("temperature", record.getTemperature());
            processInfo.put("brix", record.getBrix());
            processInfo.put("sg", record.getSg());
            processInfo.put("ph", record.getPh());
            processInfo.put("volume", record.getVolume());
            processInfo.put("operator", record.getOperator());
            processInfo.put("notes", record.getNotes());
            processInfo.put("status", checkProcessAbnormal(record));

            result.put("process_" + record.getProcessTypeId(), processInfo);
        }

        return result;
    }

    private String checkProcessAbnormal(BatchProcessRecord record) {
        StringBuilder abnormalNotes = new StringBuilder();

        if (record.getTemperature() != null) {
            BigDecimal temp = record.getTemperature();
            if (temp.compareTo(new BigDecimal("30")) > 0 || temp.compareTo(new BigDecimal("0")) < 0) {
                abnormalNotes.append("温度异常;");
            }
        }

        if (record.getPh() != null) {
            BigDecimal ph = record.getPh();
            if (ph.compareTo(new BigDecimal("7")) > 0 || ph.compareTo(new BigDecimal("4")) < 0) {
                abnormalNotes.append("pH值异常;");
            }
        }

        return abnormalNotes.length() > 0 ? abnormalNotes.toString() : "normal";
    }
}
