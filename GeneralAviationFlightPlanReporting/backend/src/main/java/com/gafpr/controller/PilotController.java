package com.gafpr.controller;

import com.gafpr.entity.Pilot;
import com.gafpr.repository.PilotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<Pilot> create(@RequestBody Pilot pilot) {
        return ResponseEntity.ok(pilotRepository.save(pilot));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pilot> update(@PathVariable Long id, @RequestBody Pilot pilot) {
        if (!pilotRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        pilot.setId(id);
        return ResponseEntity.ok(pilotRepository.save(pilot));
    }
}
