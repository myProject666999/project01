package com.lawfirm.case_management.controller;

import com.lawfirm.case_management.entity.Lawyer;
import com.lawfirm.case_management.service.LawyerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/lawyers")
@RequiredArgsConstructor
public class LawyerController {

    private final LawyerService lawyerService;

    @GetMapping
    public ResponseEntity<List<Lawyer>> getAllLawyers() {
        return ResponseEntity.ok(lawyerService.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Lawyer>> getActiveLawyers() {
        return ResponseEntity.ok(lawyerService.findActiveLawyers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lawyer> getLawyerById(@PathVariable Long id) {
        Optional<Lawyer> lawyer = lawyerService.findById(id);
        return lawyer.map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Lawyer> createLawyer(@RequestBody Lawyer lawyer) {
        return ResponseEntity.ok(lawyerService.create(lawyer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lawyer> updateLawyer(
            @PathVariable Long id,
            @RequestBody Lawyer lawyer) {
        return ResponseEntity.ok(lawyerService.update(id, lawyer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLawyer(@PathVariable Long id) {
        lawyerService.delete(id);
        return ResponseEntity.ok().build();
    }
}
