package com.maritime.pilotage.controller;

import com.maritime.pilotage.common.Result;
import com.maritime.pilotage.entity.SystemNotification;
import com.maritime.pilotage.repository.SystemNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class SystemNotificationController {

    @Autowired
    private SystemNotificationRepository systemNotificationRepository;

    @GetMapping
    public Result<List<SystemNotification>> list() {
        List<SystemNotification> list = systemNotificationRepository.findAll();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<SystemNotification> getById(@PathVariable Long id) {
        Optional<SystemNotification> notification = systemNotificationRepository.findById(id);
        return notification.map(Result::success).orElseGet(() -> Result.error("通知不存在"));
    }

    @PostMapping
    public Result<SystemNotification> create(@RequestBody SystemNotification notification) {
        SystemNotification saved = systemNotificationRepository.save(notification);
        return Result.success("创建成功", saved);
    }

    @PutMapping("/{id}")
    public Result<SystemNotification> update(@PathVariable Long id, @RequestBody SystemNotification notification) {
        if (!systemNotificationRepository.existsById(id)) {
            return Result.error("通知不存在");
        }
        notification.setId(id);
        SystemNotification updated = systemNotificationRepository.save(notification);
        return Result.success("更新成功", updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (!systemNotificationRepository.existsById(id)) {
            return Result.error("通知不存在");
        }
        systemNotificationRepository.deleteById(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/recipient/{recipientType}/{recipientId}")
    public Result<List<SystemNotification>> getByRecipient(@PathVariable Integer recipientType,
                                                           @PathVariable Long recipientId) {
        List<SystemNotification> list = systemNotificationRepository.findAll().stream()
                .filter(n -> recipientType.equals(n.getRecipientType()) && recipientId.equals(n.getRecipientId()))
                .collect(Collectors.toList());
        return Result.success(list);
    }

    @GetMapping("/unread/{recipientType}/{recipientId}")
    public Result<List<SystemNotification>> getUnreadByRecipient(@PathVariable Integer recipientType,
                                                                 @PathVariable Long recipientId) {
        List<SystemNotification> list = systemNotificationRepository.findAll().stream()
                .filter(n -> recipientType.equals(n.getRecipientType())
                        && recipientId.equals(n.getRecipientId())
                        && !n.getIsRead())
                .collect(Collectors.toList());
        return Result.success(list);
    }

    @GetMapping("/unread-count/{recipientType}/{recipientId}")
    public Result<Long> getUnreadCount(@PathVariable Integer recipientType,
                                       @PathVariable Long recipientId) {
        long count = systemNotificationRepository.findAll().stream()
                .filter(n -> recipientType.equals(n.getRecipientType())
                        && recipientId.equals(n.getRecipientId())
                        && !n.getIsRead())
                .count();
        return Result.success(count);
    }

    @PutMapping("/mark-read/{id}")
    public Result<SystemNotification> markAsRead(@PathVariable Long id) {
        Optional<SystemNotification> optional = systemNotificationRepository.findById(id);
        if (!optional.isPresent()) {
            return Result.error("通知不存在");
        }
        SystemNotification notification = optional.get();
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        SystemNotification updated = systemNotificationRepository.save(notification);
        return Result.success("标记已读成功", updated);
    }

    @PutMapping("/mark-all-read/{recipientType}/{recipientId}")
    public Result<Void> markAllAsRead(@PathVariable Integer recipientType,
                                      @PathVariable Long recipientId) {
        List<SystemNotification> list = systemNotificationRepository.findAll().stream()
                .filter(n -> recipientType.equals(n.getRecipientType())
                        && recipientId.equals(n.getRecipientId())
                        && !n.getIsRead())
                .collect(Collectors.toList());
        list.forEach(n -> {
            n.setIsRead(true);
            n.setReadAt(LocalDateTime.now());
            systemNotificationRepository.save(n);
        });
        return Result.success("全部标记已读成功", null);
    }

    @GetMapping("/type/{notificationType}")
    public Result<List<SystemNotification>> getByType(@PathVariable Integer notificationType) {
        List<SystemNotification> list = systemNotificationRepository.findAll().stream()
                .filter(n -> notificationType.equals(n.getNotificationType()))
                .collect(Collectors.toList());
        return Result.success(list);
    }

    @GetMapping("/business/{relatedBusinessType}/{relatedBusinessId}")
    public Result<List<SystemNotification>> getByBusiness(@PathVariable String relatedBusinessType,
                                                          @PathVariable Long relatedBusinessId) {
        List<SystemNotification> list = systemNotificationRepository.findAll().stream()
                .filter(n -> relatedBusinessType.equals(n.getRelatedBusinessType())
                        && relatedBusinessId.equals(n.getRelatedBusinessId()))
                .collect(Collectors.toList());
        return Result.success(list);
    }
}
