package com.gafpr.controller;

import com.gafpr.entity.Airspace;
import com.gafpr.repository.AirspaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<Airspace> create(@RequestBody Airspace airspace) {
        return ResponseEntity.ok(airspaceRepository.save(airspace));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Airspace> update(@PathVariable Long id, @RequestBody Airspace airspace) {
        if (!airspaceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        airspace.setId(id);
        return ResponseEntity.ok(airspaceRepository.save(airspace));
    }
}
