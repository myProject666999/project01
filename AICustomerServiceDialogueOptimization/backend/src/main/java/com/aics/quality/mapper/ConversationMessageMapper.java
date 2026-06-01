package com.aics.quality.mapper;

import com.aics.quality.entity.ConversationMessage;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ConversationMessageMapper extends BaseMapper<ConversationMessage> {

    @Select("SELECT * FROM cs_conversation_message WHERE session_id = #{sessionId} ORDER BY send_time ASC")
    List<ConversationMessage> selectBySessionId(@Param("sessionId") String sessionId);
}
