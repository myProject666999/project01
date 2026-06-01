package com.fishery.fryrelease.controller;

import com.fishery.fryrelease.common.Result;
import com.fishery.fryrelease.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/overview")
    public Result<Map<String, Object>> getOverview() {
        return Result.success(dashboardService.getOverview());
    }

    @GetMapping("/plan-progress")
    public Result<List<Map<String, Object>>> getPlanProgress() {
        return Result.success(dashboardService.getPlanProgress());
    }

    @GetMapping("/recapture-trend")
    public Result<List<Map<String, Object>>> getRecaptureTrend() {
        return Result.success(dashboardService.getRecaptureTrend());
    }

    @GetMapping("/water-warnings")
    public Result<List<Map<String, Object>>> getWaterWarnings() {
        return Result.success(dashboardService.getWaterWarnings());
    }
}
