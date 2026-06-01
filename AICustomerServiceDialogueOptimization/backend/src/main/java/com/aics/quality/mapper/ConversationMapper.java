package com.aics.quality.mapper;

import com.aics.quality.entity.Conversation;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ConversationMapper extends BaseMapper<Conversation> {

    @Select("SELECT * FROM cs_conversation WHERE quality_status = 0 AND start_time BETWEEN #{startTime} AND #{endTime} ORDER BY id LIMIT #{cursor}, #{batchSize}")
    List<Conversation> selectBatchForQuality(@Param("startTime") LocalDateTime startTime,
                                             @Param("endTime") LocalDateTime endTime,
                                             @Param("cursor") Long cursor,
                                             @Param("batchSize") Integer batchSize);

    @Select("SELECT COUNT(*) FROM cs_conversation WHERE quality_status = 0 AND start_time BETWEEN #{startTime} AND #{endTime}")
    Long countForQuality(@Param("startTime") LocalDateTime startTime,
                         @Param("endTime") LocalDateTime endTime);
}
