package com.gafpr.controller;

import com.gafpr.entity.ApprovalNodeConfig;
import com.gafpr.service.ApprovalNodeConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/approval-configs")
public class ApprovalNodeConfigController {

    @Autowired
    private ApprovalNodeConfigService approvalNodeConfigService;

    @GetMapping
    public ResponseEntity<List<ApprovalNodeConfig>> getAll() {
        return ResponseEntity.ok(approvalNodeConfigService.getAllConfigs());
    }

    @GetMapping("/airspace-type/{airspaceType}")
    public ResponseEntity<List<ApprovalNodeConfig>> getByAirspaceType(@PathVariable String airspaceType) {
        return ResponseEntity.ok(approvalNodeConfigService.getConfigsByAirspaceType(airspaceType));
    }

    @GetMapping("/airspace-type/{airspaceType}/level/{level}")
    public ResponseEntity<List<ApprovalNodeConfig>> getByAirspaceTypeAndLevel(
            @PathVariable String airspaceType,
            @PathVariable Integer level) {
        return ResponseEntity.ok(approvalNodeConfigService.getConfigsByAirspaceTypeAndLevel(airspaceType, level));
    }

    @PostMapping
    public ResponseEntity<ApprovalNodeConfig> create(@RequestBody ApprovalNodeConfig config) {
        return ResponseEntity.ok(approvalNodeConfigService.createConfig(config));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApprovalNodeConfig> update(@PathVariable Long id, @RequestBody ApprovalNodeConfig config) {
        ApprovalNodeConfig updated = approvalNodeConfigService.updateConfig(id, config);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        boolean deleted = approvalNodeConfigService.deleteConfig(id);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}
