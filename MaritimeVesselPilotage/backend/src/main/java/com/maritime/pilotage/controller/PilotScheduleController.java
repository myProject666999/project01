package com.maritime.pilotage.controller;

import com.maritime.pilotage.common.Result;
import com.maritime.pilotage.dto.AvailablePilotDTO;
import com.maritime.pilotage.dto.PilotScheduleCheckRequestDTO;
import com.maritime.pilotage.dto.PilotScheduleCheckResultDTO;
import com.maritime.pilotage.entity.PilotSchedule;
import com.maritime.pilotage.repository.PilotScheduleRepository;
import com.maritime.pilotage.service.PilotScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pilot-schedules")
public class PilotScheduleController {

    @Autowired
    private PilotScheduleRepository pilotScheduleRepository;

    @Autowired
    private PilotScheduleService pilotScheduleService;

    @GetMapping
    public Result<List<PilotSchedule>> list() {
        List<PilotSchedule> list = pilotScheduleRepository.findAll();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<PilotSchedule> getById(@PathVariable Long id) {
        Optional<PilotSchedule> schedule = pilotScheduleRepository.findById(id);
        return schedule.map(Result::success).orElseGet(() -> Result.error("排班不存在"));
    }

    @PostMapping
    public Result<PilotSchedule> create(@RequestBody PilotSchedule schedule) {
        PilotSchedule saved = pilotScheduleRepository.save(schedule);
        return Result.success("创建成功", saved);
    }

    @PutMapping("/{id}")
    public Result<PilotSchedule> update(@PathVariable Long id, @RequestBody PilotSchedule schedule) {
        if (!pilotScheduleRepository.existsById(id)) {
            return Result.error("排班不存在");
        }
        schedule.setId(id);
        PilotSchedule updated = pilotScheduleRepository.save(schedule);
        return Result.success("更新成功", updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (!pilotScheduleRepository.existsById(id)) {
            return Result.error("排班不存在");
        }
        pilotScheduleRepository.deleteById(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/pilot/{pilotId}")
    public Result<List<PilotSchedule>> getByPilotId(@PathVariable Long pilotId) {
        List<PilotSchedule> list = pilotScheduleRepository.findAll().stream()
                .filter(s -> pilotId.equals(s.getPilotId()))
                .collect(Collectors.toList());
        return Result.success(list);
    }

    @GetMapping("/date/{date}")
    public Result<List<PilotSchedule>> getByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<PilotSchedule> list = pilotScheduleRepository.findAll().stream()
                .filter(s -> date.equals(s.getScheduleDate()))
                .collect(Collectors.toList());
        return Result.success(list);
    }

    @PostMapping("/check")
    public Result<PilotScheduleCheckResultDTO> checkSchedule(@RequestBody PilotScheduleCheckRequestDTO request) {
        PilotScheduleCheckResultDTO result = pilotScheduleService.checkPilotSchedule(request);
        return Result.success(result);
    }

    @GetMapping("/available-pilots")
    public Result<List<AvailablePilotDTO>> findAvailablePilots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime plannedTime,
            @RequestParam BigDecimal vesselDeadweightTonnage,
            @RequestParam Integer vesselLevel) {
        List<AvailablePilotDTO> result = pilotScheduleService.findAvailablePilots(plannedTime, vesselDeadweightTonnage, vesselLevel);
        return Result.success(result);
    }

    @GetMapping("/recommend-pilot")
    public Result<AvailablePilotDTO> recommendBestPilot(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime plannedTime,
            @RequestParam BigDecimal vesselDeadweightTonnage,
            @RequestParam Integer vesselLevel) {
        AvailablePilotDTO result = pilotScheduleService.recommendBestPilot(plannedTime, vesselDeadweightTonnage, vesselLevel);
        return Result.success(result);
    }

    @GetMapping("/check-qualification")
    public Result<Boolean> checkPilotQualification(
            @RequestParam Long pilotId,
            @RequestParam BigDecimal vesselDeadweightTonnage,
            @RequestParam Integer vesselLevel) {
        boolean result = pilotScheduleService.checkPilotQualification(pilotId, vesselDeadweightTonnage, vesselLevel);
        return Result.success(result);
    }
}
