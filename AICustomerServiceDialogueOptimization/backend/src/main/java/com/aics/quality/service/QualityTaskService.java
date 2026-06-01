package com.aics.quality.service;

import cn.hutool.core.util.IdUtil;
import com.aics.quality.common.PageQuery;
import com.aics.quality.common.PageResult;
import com.aics.quality.entity.Conversation;
import com.aics.quality.entity.QualityTask;
import com.aics.quality.mapper.QualityTaskMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class QualityTaskService {

    @Autowired
    private QualityTaskMapper qualityTaskMapper;

    @Autowired
    private ConversationService conversationService;

    @Autowired
    private QualityService qualityService;

    public PageResult<QualityTask> list(PageQuery pageQuery, String keyword, Integer status) {
        LambdaQueryWrapper<QualityTask> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(QualityTask::getTaskName, keyword)
                    .or().like(QualityTask::getTaskNo, keyword);
        }
        if (status != null) {
            wrapper.eq(QualityTask::getStatus, status);
        }
        wrapper.orderByDesc(QualityTask::getCreateTime);

        Page<QualityTask> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        qualityTaskMapper.selectPage(page, wrapper);

        return PageResult.of(page.getTotal(), page.getRecords(), pageQuery.getPageNum(), pageQuery.getPageSize());
    }

    public QualityTask getById(Long id) {
        return qualityTaskMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public QualityTask create(QualityTask task) {
        task.setTaskNo("TASK" + IdUtil.getSnowflakeNextIdStr());
        task.setStatus(0);
        task.setProcessedCount(0);
        task.setPassCount(0);
        task.setViolationCount(0);
        task.setCreateBy("admin");
        task.setCreateTime(LocalDateTime.now());
        qualityTaskMapper.insert(task);
        return task;
    }

    @Async
    @Transactional(rollbackFor = Exception.class)
    public void executeTask(Long taskId) {
        QualityTask task = qualityTaskMapper.selectById(taskId);
        if (task == null) {
            return;
        }

        task.setStatus(1);
        task.setStartTime(LocalDateTime.now());
        qualityTaskMapper.updateById(task);

        try {
            LocalDateTime startTime = task.getTimeRangeStart();
            LocalDateTime endTime = task.getTimeRangeEnd();
            int batchSize = 1000;
            long cursor = 0;
            int totalProcessed = 0;
            int passCount = 0;
            int violationCount = 0;

            Long totalCount = conversationService.countForQuality(startTime, endTime);
            task.setTotalCount(totalCount.intValue());

            while (true) {
                List<Conversation> conversations = conversationService.selectBatchForQuality(startTime, endTime, cursor, batchSize);
                if (conversations.isEmpty()) {
                    break;
                }

                for (Conversation conversation : conversations) {
                    boolean hasViolation = qualityService.qualityConversation(taskId, conversation, task.getQualityType());
                    totalProcessed++;
                    if (hasViolation) {
                        violationCount++;
                    } else {
                        passCount++;
                    }
                }

                cursor += conversations.size();

                task.setProcessedCount(totalProcessed);
                task.setPassCount(passCount);
                task.setViolationCount(violationCount);
                qualityTaskMapper.updateById(task);

                if (conversations.size() < batchSize) {
                    break;
                }
            }

            task.setStatus(2);
            task.setEndTime(LocalDateTime.now());
            qualityTaskMapper.updateById(task);

        } catch (Exception e) {
            task.setStatus(3);
            task.setEndTime(LocalDateTime.now());
            qualityTaskMapper.updateById(task);
        }
    }
}
