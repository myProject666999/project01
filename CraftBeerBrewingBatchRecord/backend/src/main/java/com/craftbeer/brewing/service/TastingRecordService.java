package com.craftbeer.brewing.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.craftbeer.brewing.entity.TastingRecord;

import java.util.List;

/**
 * 品测记录Service接口
 */
public interface TastingRecordService extends IService<TastingRecord> {

    /**
     * 添加品测记录
     */
    boolean addTastingRecord(TastingRecord tastingRecord);

    /**
     * 根据批次ID查询品测记录
     */
    List<TastingRecord> getByBatchId(Long batchId);

    /**
     * 查询不合格品测记录
     */
    List<TastingRecord> getFailedRecords();

    /**
     * 统计批次品测平均分
     */
    TastingRecord getAverageScores(Long batchId);
}
