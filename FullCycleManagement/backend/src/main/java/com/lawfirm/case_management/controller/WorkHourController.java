package com.lawfirm.case_management.controller;

import com.lawfirm.case_management.entity.WorkHour;
import com.lawfirm.case_management.service.WorkHourService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/work-hours")
@RequiredArgsConstructor
public class WorkHourController {

    private final WorkHourService workHourService;

    @GetMapping
    public ResponseEntity<List<WorkHour>> getAllWorkHours() {
        return ResponseEntity.ok(workHourService.findAll());
    }

    @GetMapping("/case/{caseId}")
    public ResponseEntity<List<WorkHour>> getWorkHoursByCaseId(@PathVariable Long caseId) {
        return ResponseEntity.ok(workHourService.findByCaseId(caseId));
    }

    @GetMapping("/lawyer/{lawyerId}")
    public ResponseEntity<List<WorkHour>> getWorkHoursByLawyerId(@PathVariable Long lawyerId) {
        return ResponseEntity.ok(workHourService.findByLawyerId(lawyerId));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<WorkHour>> getWorkHoursByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(workHourService.findByDateRange(startDate, endDate));
    }

    @PostMapping
    public ResponseEntity<WorkHour> createWorkHour(@RequestBody WorkHour workHour) {
        return ResponseEntity.ok(workHourService.createWorkHour(workHour));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkHour> updateWorkHour(
            @PathVariable Long id,
            @RequestBody WorkHour workHour) {
        return ResponseEntity.ok(workHourService.updateWorkHour(id, workHour));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkHour(@PathVariable Long id) {
        workHourService.deleteWorkHour(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/monthly-bill/{lawyerId}")
    public ResponseEntity<WorkHourService.MonthlyBill> getMonthlyBill(
            @PathVariable Long lawyerId,
            @RequestParam Integer year,
            @RequestParam Integer month) {
        return ResponseEntity.ok(workHourService.generateMonthlyBill(lawyerId, year, month));
    }

    @GetMapping("/monthly-bill/all")
    public ResponseEntity<Map<Long, WorkHourService.MonthlyBill>> getAllMonthlyBills(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        return ResponseEntity.ok(workHourService.generateAllLawyersMonthlyBill(year, month));
    }
}
