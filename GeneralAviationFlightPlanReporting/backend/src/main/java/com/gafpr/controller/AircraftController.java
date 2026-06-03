package com.gafpr.controller;

import com.gafpr.entity.Aircraft;
import com.gafpr.repository.AircraftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/aircrafts")
public class AircraftController {

    @Autowired
    private AircraftRepository aircraftRepository;

    @GetMapping
    public ResponseEntity<List<Aircraft>> getAll() {
        return ResponseEntity.ok(aircraftRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Aircraft> getById(@PathVariable Long id) {
        return aircraftRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Aircraft>> getByStatus(@PathVariable Integer status) {
        return ResponseEntity.ok(aircraftRepository.findByStatus(status));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Aircraft aircraft) {
        try {
            return ResponseEntity.ok(aircraftRepository.save(aircraft));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            String msg = e.getMessage();
            if (msg != null && msg.contains("Duplicate entry")) {
                error.put("error", "注册号已存在");
            } else {
                error.put("error", "创建失败: " + msg);
            }
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Aircraft aircraft) {
        if (!aircraftRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        try {
            aircraft.setId(id);
            return ResponseEntity.ok(aircraftRepository.save(aircraft));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "更新失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
