package com.craftbeer.brewing.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.craftbeer.brewing.dto.BatchDTO;
import com.craftbeer.brewing.dto.TraceabilityQueryDTO;
import com.craftbeer.brewing.entity.BrewingBatch;

import java.util.List;

/**
 * 酿造批次Service接口
 */
public interface BrewingBatchService extends IService<BrewingBatch> {

    /**
     * 创建批次
     */
    BrewingBatch createBatch(BatchDTO batchDTO);

    /**
     * 更新批次
     */
    boolean updateBatch(BatchDTO batchDTO);

    /**
     * 根据ID获取批次详情（包含工序记录）
     */
    BatchDTO getBatchDetailById(Long id);

    /**
     * 按原料追溯不合格批次
     */
    List<BrewingBatch> traceByMaterial(Long materialId);

    /**
     * 按工序追溯不合格批次
     */
    List<BrewingBatch> traceByProcess(Long processTypeId);

    /**
     * 多条件追溯查询
     */
    IPage<BrewingBatch> traceBatch(TraceabilityQueryDTO queryDTO);
}
