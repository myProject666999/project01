package com.craftbeer.brewing.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.craftbeer.brewing.entity.ProcessType;
import com.craftbeer.brewing.mapper.ProcessTypeMapper;
import com.craftbeer.brewing.service.ProcessTypeService;
import org.springframework.stereotype.Service;

/**
 * 工序类型Service实现类
 */
@Service
public class ProcessTypeServiceImpl extends ServiceImpl<ProcessTypeMapper, ProcessType> implements ProcessTypeService {
}
