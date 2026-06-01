package com.aics.quality.mapper;

import com.aics.quality.entity.QualityResultAi;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface QualityResultAiMapper extends BaseMapper<QualityResultAi> {

    @Select("SELECT * FROM cs_quality_result_ai WHERE session_id = #{sessionId}")
    QualityResultAi selectBySessionId(@Param("sessionId") String sessionId);
}
