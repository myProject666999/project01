package com.craftbeer.brewing.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.craftbeer.brewing.entity.Material;
import com.craftbeer.brewing.mapper.MaterialMapper;
import com.craftbeer.brewing.service.MaterialService;
import org.springframework.stereotype.Service;

/**
 * 原料Service实现类
 */
@Service
public class MaterialServiceImpl extends ServiceImpl<MaterialMapper, Material> implements MaterialService {
}
