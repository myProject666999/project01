package com.aics.quality.mapper;

import com.aics.quality.entity.CsScore;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface CsScoreMapper extends BaseMapper<CsScore> {

    @Select("SELECT * FROM cs_cs_score WHERE statistics_month = #{month} ORDER BY total_score DESC")
    List<CsScore> selectByMonthOrderByScore(@Param("month") String month);
}
