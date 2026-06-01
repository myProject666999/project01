package com.maritime.pilotage.controller;

import com.maritime.pilotage.common.Result;
import com.maritime.pilotage.dto.TideWindowMatchRequestDTO;
import com.maritime.pilotage.dto.TideWindowMatchResultDTO;
import com.maritime.pilotage.entity.Tide;
import com.maritime.pilotage.repository.TideRepository;
import com.maritime.pilotage.service.TideMatchingService;
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
@RequestMapping("/api/tides")
public class TideController {

    @Autowired
    private TideRepository tideRepository;

    @Autowired
    private TideMatchingService tideMatchingService;

    @GetMapping
    public Result<List<Tide>> list() {
        List<Tide> list = tideRepository.findAll();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<Tide> getById(@PathVariable Long id) {
        Optional<Tide> tide = tideRepository.findById(id);
        return tide.map(Result::success).orElseGet(() -> Result.error("潮汐数据不存在"));
    }

    @PostMapping
    public Result<Tide> create(@RequestBody Tide tide) {
        Tide saved = tideRepository.save(tide);
        return Result.success("创建成功", saved);
    }

    @PutMapping("/{id}")
    public Result<Tide> update(@PathVariable Long id, @RequestBody Tide tide) {
        if (!tideRepository.existsById(id)) {
            return Result.error("潮汐数据不存在");
        }
        tide.setId(id);
        Tide updated = tideRepository.save(tide);
        return Result.success("更新成功", updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (!tideRepository.existsById(id)) {
            return Result.error("潮汐数据不存在");
        }
        tideRepository.deleteById(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/date/{date}")
    public Result<List<Tide>> getByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Tide> list = tideRepository.findAll().stream()
                .filter(t -> date.equals(t.getTideDate()))
                .collect(Collectors.toList());
        return Result.success(list);
    }

    @GetMapping("/date-range")
    public Result<List<Tide>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Tide> list = tideRepository.findAll().stream()
                .filter(t -> !t.getTideDate().isBefore(startDate) && !t.getTideDate().isAfter(endDate))
                .collect(Collectors.toList());
        return Result.success(list);
    }

    @PostMapping("/match-window")
    public Result<TideWindowMatchResultDTO> matchTideWindows(@RequestBody TideWindowMatchRequestDTO request) {
        TideWindowMatchResultDTO result = tideMatchingService.matchTideWindows(request);
        return Result.success(result);
    }

    @PostMapping("/nearest-window")
    public Result<TideWindowMatchResultDTO> findNearestAvailableWindow(@RequestBody TideWindowMatchRequestDTO request) {
        TideWindowMatchResultDTO result = tideMatchingService.findNearestAvailableWindow(request);
        return Result.success(result);
    }

    @GetMapping("/check-sufficiency")
    public Result<Boolean> checkTideSufficiency(
            @RequestParam Long vesselId,
            @RequestParam BigDecimal draft,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime time) {
        boolean result = tideMatchingService.checkTideSufficiency(vesselId, draft, time);
        return Result.success(result);
    }
}
