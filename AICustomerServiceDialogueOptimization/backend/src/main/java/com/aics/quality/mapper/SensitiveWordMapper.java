package com.aics.quality.mapper;

import com.aics.quality.entity.SensitiveWord;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SensitiveWordMapper extends BaseMapper<SensitiveWord> {

    @Select("SELECT * FROM cs_sensitive_word WHERE is_enabled = 1")
    List<SensitiveWord> selectEnabledWords();
}
