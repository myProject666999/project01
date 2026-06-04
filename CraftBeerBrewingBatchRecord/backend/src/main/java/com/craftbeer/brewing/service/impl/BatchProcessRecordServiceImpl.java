package com.craftbeer.brewing.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.craftbeer.brewing.entity.BatchProcessRecord;
import com.craftbeer.brewing.mapper.BatchProcessRecordMapper;
import com.craftbeer.brewing.service.BatchProcessRecordService;
import org.springframework.stereotype.Service;

/**
 * 批次工序记录Service实现类
 */
@Service
public class BatchProcessRecordServiceImpl extends ServiceImpl<BatchProcessRecordMapper, BatchProcessRecord> implements BatchProcessRecordService {
}
