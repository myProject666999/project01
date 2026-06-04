package com.craftbeer.brewing.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.craftbeer.brewing.entity.MaterialType;
import com.craftbeer.brewing.mapper.MaterialTypeMapper;
import com.craftbeer.brewing.service.MaterialTypeService;
import org.springframework.stereotype.Service;

/**
 * 原料类型Service实现类
 */
@Service
public class MaterialTypeServiceImpl extends ServiceImpl<MaterialTypeMapper, MaterialType> implements MaterialTypeService {
}
