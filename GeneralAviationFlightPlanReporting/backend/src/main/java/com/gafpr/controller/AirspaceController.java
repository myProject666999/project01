package com.gafpr.controller;

import com.gafpr.entity.Airspace;
import com.gafpr.repository.AirspaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/airspaces")
public class AirspaceController {

    @Autowired
    private AirspaceRepository airspaceRepository;

    @GetMapping
    public ResponseEntity<List<Airspace>> getAll() {
        return ResponseEntity.ok(airspaceRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Airspace> getById(@PathVariable Long id) {
        return airspaceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Airspace>> getByType(@PathVariable String type) {
        return ResponseEntity.ok(airspaceRepository.findByType(type));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Airspace airspace) {
        try {
            return ResponseEntity.ok(airspaceRepository.save(airspace));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            String msg = e.getMessage();
            if (msg != null && msg.contains("Duplicate entry")) {
                error.put("error", "空域代码已存在");
            } else {
                error.put("error", "创建失败: " + msg);
            }
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Airspace airspace) {
        if (!airspaceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        try {
            airspace.setId(id);
            return ResponseEntity.ok(airspaceRepository.save(airspace));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "更新失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
