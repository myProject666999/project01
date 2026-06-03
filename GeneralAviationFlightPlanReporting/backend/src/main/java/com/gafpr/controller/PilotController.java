package com.gafpr.controller;

import com.gafpr.entity.Pilot;
import com.gafpr.repository.PilotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pilots")
public class PilotController {

    @Autowired
    private PilotRepository pilotRepository;

    @GetMapping
    public ResponseEntity<List<Pilot>> getAll() {
        return ResponseEntity.ok(pilotRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pilot> getById(@PathVariable Long id) {
        return pilotRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Pilot> getByUserId(@PathVariable Long userId) {
        return pilotRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Pilot pilot) {
        try {
            return ResponseEntity.ok(pilotRepository.save(pilot));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            String msg = e.getMessage();
            if (msg != null && msg.contains("Duplicate entry")) {
                error.put("error", "执照号已存在");
            } else if (msg != null && msg.contains("foreign key")) {
                error.put("error", "关联用户不存在");
            } else {
                error.put("error", "创建失败: " + msg);
            }
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Pilot pilot) {
        if (!pilotRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        try {
            pilot.setId(id);
            return ResponseEntity.ok(pilotRepository.save(pilot));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "更新失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
