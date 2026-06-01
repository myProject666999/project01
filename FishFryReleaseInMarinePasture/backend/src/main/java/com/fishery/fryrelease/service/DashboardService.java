package com.fishery.fryrelease.service;

import java.util.List;
import java.util.Map;

public interface DashboardService {
    Map<String, Object> getOverview();

    List<Map<String, Object>> getPlanProgress();

    List<Map<String, Object>> getRecaptureTrend();

    List<Map<String, Object>> getWaterWarnings();
}
