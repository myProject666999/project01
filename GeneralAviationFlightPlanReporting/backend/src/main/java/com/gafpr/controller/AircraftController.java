package com.gafpr.controller;

import com.gafpr.entity.Aircraft;
import com.gafpr.repository.AircraftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<Aircraft> create(@RequestBody Aircraft aircraft) {
        return ResponseEntity.ok(aircraftRepository.save(aircraft));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Aircraft> update(@PathVariable Long id, @RequestBody Aircraft aircraft) {
        if (!aircraftRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        aircraft.setId(id);
        return ResponseEntity.ok(aircraftRepository.save(aircraft));
    }
}
