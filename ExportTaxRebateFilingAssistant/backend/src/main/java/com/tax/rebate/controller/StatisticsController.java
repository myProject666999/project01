package com.tax.rebate.controller;

import com.tax.rebate.dto.Result;
import com.tax.rebate.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/dashboard")
    public Result<Map<String, Object>> dashboard() {
        return Result.ok(statisticsService.dashboard());
    }

    @GetMapping("/matching-status")
    public Result<Map<String, Object>> matchingStatusStats() {
        return Result.ok(statisticsService.matchingStatusStats());
    }
}
