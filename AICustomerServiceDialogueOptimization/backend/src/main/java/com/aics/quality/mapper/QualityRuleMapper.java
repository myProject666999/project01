package com.aics.quality.mapper;

import com.aics.quality.entity.QualityRule;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface QualityRuleMapper extends BaseMapper<QualityRule> {

    @Select("SELECT * FROM cs_quality_rule WHERE is_enabled = 1")
    List<QualityRule> selectEnabledRules();
}
