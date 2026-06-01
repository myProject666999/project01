package com.aics.quality.mapper;

import com.aics.quality.entity.QualityResultRule;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface QualityResultRuleMapper extends BaseMapper<QualityResultRule> {

    @Select("SELECT * FROM cs_quality_result_rule WHERE session_id = #{sessionId}")
    List<QualityResultRule> selectBySessionId(@Param("sessionId") String sessionId);
}
