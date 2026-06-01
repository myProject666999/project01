package com.gafpr.controller;

import com.gafpr.entity.WeatherBriefing;
import com.gafpr.service.WeatherBriefingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/weather-briefings")
public class WeatherBriefingController {

    @Autowired
    private WeatherBriefingService weatherBriefingService;

    @GetMapping("/flight-plan/{flightPlanId}")
    public ResponseEntity<List<WeatherBriefing>> getByFlightPlan(@PathVariable Long flightPlanId) {
        return ResponseEntity.ok(weatherBriefingService.getBriefingsByFlightPlan(flightPlanId));
    }

    @GetMapping("/flight-plan/{flightPlanId}/latest")
    public ResponseEntity<WeatherBriefing> getLatestValid(@PathVariable Long flightPlanId) {
        WeatherBriefing briefing = weatherBriefingService.getLatestValidBriefing(flightPlanId);
        return briefing != null ? ResponseEntity.ok(briefing) : ResponseEntity.notFound().build();
    }

    @PostMapping("/generate/{flightPlanId}")
    public ResponseEntity<WeatherBriefing> generate(@PathVariable Long flightPlanId) {
        WeatherBriefing briefing = weatherBriefingService.generateBriefing(flightPlanId);
        return briefing != null ? ResponseEntity.ok(briefing) : ResponseEntity.notFound().build();
    }
}
