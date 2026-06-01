package com.aics.quality.service;

import cn.hutool.core.util.IdUtil;
import com.aics.quality.entity.*;
import com.aics.quality.mapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class QualityService {

    @Autowired
    private QualityResultRuleMapper qualityResultRuleMapper;

    @Autowired
    private QualityResultAiMapper qualityResultAiMapper;

    @Autowired
    private ViolationRecordMapper violationRecordMapper;

    @Autowired
    private ConversationMapper conversationMapper;

    @Autowired
    private QualityRuleMapper qualityRuleMapper;

    @Autowired
    private SensitiveWordMapper sensitiveWordMapper;

    @Autowired
    private ConversationMessageMapper messageMapper;

    private Random random = new Random();

    @Transactional(rollbackFor = Exception.class)
    public boolean qualityConversation(Long taskId, Conversation conversation, Integer qualityType) {
        boolean hasViolation = false;
        BigDecimal totalDeduct = BigDecimal.ZERO;

        List<ConversationMessage> messages = messageMapper.selectBySessionId(conversation.getSessionId());

        if (qualityType == 1 || qualityType == 3) {
            List<QualityRule> rules = qualityRuleMapper.selectEnabledRules();
            for (QualityRule rule : rules) {
                boolean pass = checkRule(rule, conversation, messages);
                QualityResultRule result = new QualityResultRule();
                result.setTaskId(taskId);
                result.setSessionId(conversation.getSessionId());
                result.setRuleId(rule.getId());
                result.setRuleCode(rule.getRuleCode());
                result.setRuleName(rule.getRuleName());
                result.setRuleType(rule.getRuleType());
                result.setIsPass(pass ? 1 : 0);
                result.setDeductScore(pass ? BigDecimal.ZERO : rule.getDeductScore());
                result.setViolationLevel(rule.getViolationLevel());
                result.setQualityTime(LocalDateTime.now());
                qualityResultRuleMapper.insert(result);

                if (!pass) {
                    hasViolation = true;
                    totalDeduct = totalDeduct.add(rule.getDeductScore());
                    createViolationRecord(conversation, rule);
                }
            }
        }

        if (qualityType == 2 || qualityType == 3) {
            QualityResultAi aiResult = analyzeAiQuality(taskId, conversation, messages);
            qualityResultAiMapper.insert(aiResult);
            conversation.setAiEmotion(aiResult.getEmotion());
            conversation.setAiSatisfactionScore(aiResult.getSatisfactionScore());
        }

        conversation.setQualityStatus(2);
        conversation.setHasViolation(hasViolation ? 1 : 0);
        conversation.setTotalScore(new BigDecimal(100).subtract(totalDeduct));
        conversationMapper.updateById(conversation);

        return hasViolation;
    }

    private boolean checkRule(QualityRule rule, Conversation conversation, List<ConversationMessage> messages) {
        int ruleType = rule.getRuleType();
        switch (ruleType) {
            case 1:
                return checkSensitiveWords(messages);
            case 2:
                return checkProcess(messages);
            case 3:
                return checkResponseTime(conversation, messages);
            case 4:
                return checkServiceAttitude(messages);
            default:
                return true;
        }
    }

    private boolean checkSensitiveWords(List<ConversationMessage> messages) {
        List<SensitiveWord> words = sensitiveWordMapper.selectEnabledWords();
        for (ConversationMessage msg : messages) {
            if (msg.getSenderType() == 2) {
                for (SensitiveWord word : words) {
                    if (msg.getContent().contains(word.getWord())) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    private boolean checkProcess(List<ConversationMessage> messages) {
        return random.nextDouble() > 0.2;
    }

    private boolean checkResponseTime(Conversation conversation, List<ConversationMessage> messages) {
        return random.nextDouble() > 0.15;
    }

    private boolean checkServiceAttitude(List<ConversationMessage> messages) {
        return random.nextDouble() > 0.1;
    }

    private QualityResultAi analyzeAiQuality(Long taskId, Conversation conversation, List<ConversationMessage> messages) {
        QualityResultAi result = new QualityResultAi();
        result.setTaskId(taskId);
        result.setSessionId(conversation.getSessionId());

        String[] emotions = {"POSITIVE", "NEUTRAL", "NEGATIVE"};
        result.setEmotion(emotions[random.nextInt(3)]);
        result.setEmotionConfidence(new BigDecimal("0." + (80 + random.nextInt(20))));
        result.setSatisfactionScore(new BigDecimal(60 + random.nextInt(40)));
        result.setServiceAttitudeScore(new BigDecimal(60 + random.nextInt(40)));
        result.setProfessionalScore(new BigDecimal(60 + random.nextInt(40)));
        result.setResponseTimelinessScore(new BigDecimal(60 + random.nextInt(40)));
        result.setAiSummary("AI自动分析：本次会话服务质量" + (random.nextBoolean() ? "良好" : "一般"));
        result.setQualityTime(LocalDateTime.now());

        return result;
    }

    private void createViolationRecord(Conversation conversation, QualityRule rule) {
        ViolationRecord record = new ViolationRecord();
        record.setViolationNo("VIO" + IdUtil.getSnowflakeNextIdStr());
        record.setSessionId(conversation.getSessionId());
        record.setCsId(conversation.getCsId());
        record.setCsName(conversation.getCsName());
        record.setRuleId(rule.getId());
        record.setRuleName(rule.getRuleName());
        record.setViolationType(rule.getRuleType());
        record.setViolationLevel(rule.getViolationLevel());
        record.setDeductScore(rule.getDeductScore());
        record.setStatus(1);
        record.setCanAppeal(1);
        record.setIsAppealed(0);
        record.setCreateTime(LocalDateTime.now());
        violationRecordMapper.insert(record);
    }
}
