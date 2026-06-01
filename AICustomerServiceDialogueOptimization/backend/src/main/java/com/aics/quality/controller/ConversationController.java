package com.aics.quality.controller;

import com.aics.quality.common.PageQuery;
import com.aics.quality.common.PageResult;
import com.aics.quality.common.Result;
import com.aics.quality.entity.Conversation;
import com.aics.quality.entity.ConversationMessage;
import com.aics.quality.service.ConversationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/conversation")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @GetMapping("/list")
    public Result<PageResult<Conversation>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer qualityStatus,
            @RequestParam(required = false) Integer hasViolation) {
        PageQuery pageQuery = new PageQuery();
        pageQuery.setPageNum(pageNum);
        pageQuery.setPageSize(pageSize);
        return Result.success(conversationService.list(pageQuery, keyword, qualityStatus, hasViolation));
    }

    @GetMapping("/{id}")
    public Result<Conversation> getById(@PathVariable Long id) {
        return Result.success(conversationService.getById(id));
    }

    @GetMapping("/session/{sessionId}")
    public Result<Conversation> getBySessionId(@PathVariable String sessionId) {
        return Result.success(conversationService.getBySessionId(sessionId));
    }

    @GetMapping("/{sessionId}/messages")
    public Result<List<ConversationMessage>> getMessages(@PathVariable String sessionId) {
        return Result.success(conversationService.getMessages(sessionId));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody Conversation conversation) {
        return Result.success(conversationService.save(conversation));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody Conversation conversation) {
        return Result.success(conversationService.update(conversation));
    }
}
