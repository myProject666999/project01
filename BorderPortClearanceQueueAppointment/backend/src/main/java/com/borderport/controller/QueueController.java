package com.borderport.controller;

import com.borderport.common.Result;
import com.borderport.service.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
public class QueueController {

    private final QueueService queueService;

    @GetMapping("/{portId}")
    public Result getQueueInfo(@PathVariable Long portId) {
        return Result.ok(queueService.getQueueInfo(portId));
    }

    @PutMapping("/{recordId}/status")
    public Result updateStatus(@PathVariable Long recordId, @RequestParam String status) {
        queueService.updateQueueStatus(recordId, status);
        return Result.ok();
    }

    @PutMapping("/{recordId}/clear")
    public Result clearVehicle(@PathVariable Long recordId) {
        queueService.clearVehicle(recordId);
        return Result.ok();
    }
}
