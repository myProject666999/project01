package com.aics.quality.service;

import com.aics.quality.common.PageQuery;
import com.aics.quality.common.PageResult;
import com.aics.quality.entity.Conversation;
import com.aics.quality.entity.ConversationMessage;
import com.aics.quality.mapper.ConversationMapper;
import com.aics.quality.mapper.ConversationMessageMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ConversationService {

    @Autowired
    private ConversationMapper conversationMapper;

    @Autowired
    private ConversationMessageMapper messageMapper;

    public PageResult<Conversation> list(PageQuery pageQuery, String keyword, Integer qualityStatus, Integer hasViolation) {
        LambdaQueryWrapper<Conversation> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Conversation::getSessionId, keyword)
                    .or().like(Conversation::getCsName, keyword);
        }
        if (qualityStatus != null) {
            wrapper.eq(Conversation::getQualityStatus, qualityStatus);
        }
        if (hasViolation != null) {
            wrapper.eq(Conversation::getHasViolation, hasViolation);
        }
        wrapper.orderByDesc(Conversation::getCreateTime);

        Page<Conversation> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        conversationMapper.selectPage(page, wrapper);

        return PageResult.of(page.getTotal(), page.getRecords(), pageQuery.getPageNum(), pageQuery.getPageSize());
    }

    public Conversation getById(Long id) {
        return conversationMapper.selectById(id);
    }

    public Conversation getBySessionId(String sessionId) {
        LambdaQueryWrapper<Conversation> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Conversation::getSessionId, sessionId);
        return conversationMapper.selectOne(wrapper);
    }

    public List<ConversationMessage> getMessages(String sessionId) {
        return messageMapper.selectBySessionId(sessionId);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean save(Conversation conversation) {
        return conversationMapper.insert(conversation) > 0;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean update(Conversation conversation) {
        return conversationMapper.updateById(conversation) > 0;
    }

    @Transactional(rollbackFor = Exception.class)
    public void importConversation(Conversation conversation, List<ConversationMessage> messages) {
        conversationMapper.insert(conversation);
        for (ConversationMessage message : messages) {
            message.setSessionId(conversation.getSessionId());
            messageMapper.insert(message);
        }
    }

    public List<Conversation> selectBatchForQuality(LocalDateTime startTime, LocalDateTime endTime, Long cursor, Integer batchSize) {
        return conversationMapper.selectBatchForQuality(startTime, endTime, cursor, batchSize);
    }

    public Long countForQuality(LocalDateTime startTime, LocalDateTime endTime) {
        return conversationMapper.countForQuality(startTime, endTime);
    }
}
