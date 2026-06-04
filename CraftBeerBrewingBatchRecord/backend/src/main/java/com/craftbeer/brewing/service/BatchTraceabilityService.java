package com.craftbeer.brewing.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.craftbeer.brewing.dto.TraceabilityQueryDTO;
import com.craftbeer.brewing.entity.BatchTraceability;

/**
 * 批次追溯Service接口
 */
public interface BatchTraceabilityService extends IService<BatchTraceability> {

    /**
     * 创建追溯记录
     */
    BatchTraceability createTraceability(BatchTraceability traceability);

    /**
     * 执行批次追溯分析
     */
    BatchTraceability analyzeTraceability(Long batchId, String traceType);

    /**
     * 分页查询追溯记录
     */
    IPage<BatchTraceability> queryTraceability(TraceabilityQueryDTO queryDTO);

    /**
     * 根据批次ID获取追溯记录
     */
    BatchTraceability getByBatchId(Long batchId);
}
