package com.gafpr.controller;

import com.gafpr.entity.FlightPlan;
import com.gafpr.service.FlightPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/flight-plans")
public class FlightPlanController {

    @Autowired
    private FlightPlanService flightPlanService;

    @GetMapping
    public ResponseEntity<List<FlightPlan>> getAll() {
        return ResponseEntity.ok(flightPlanService.getAllFlightPlans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlightPlan> getById(@PathVariable Long id) {
        FlightPlan plan = flightPlanService.getFlightPlanById(id);
        return plan != null ? ResponseEntity.ok(plan) : ResponseEntity.notFound().build();
    }

    @GetMapping("/pilot/{pilotId}")
    public ResponseEntity<List<FlightPlan>> getByPilot(@PathVariable Long pilotId) {
        return ResponseEntity.ok(flightPlanService.getFlightPlansByPilot(pilotId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<FlightPlan>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(flightPlanService.getFlightPlansByStatus(status));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody FlightPlan flightPlan) {
        try {
            FlightPlan created = flightPlanService.createFlightPlan(flightPlan);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody FlightPlan flightPlan) {
        try {
            FlightPlan updated = flightPlanService.updateFlightPlan(id, flightPlan);
            return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submit(@PathVariable Long id) {
        try {
            FlightPlan submitted = flightPlanService.submitFlightPlan(id);
            return submitted != null ? ResponseEntity.ok(submitted) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<?> close(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime actualDeparture,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime actualArrival) {
        try {
            FlightPlan closed = flightPlanService.closeFlightPlan(id, actualDeparture, actualArrival);
            return closed != null ? ResponseEntity.ok(closed) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            boolean deleted = flightPlanService.deleteFlightPlan(id);
            return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
