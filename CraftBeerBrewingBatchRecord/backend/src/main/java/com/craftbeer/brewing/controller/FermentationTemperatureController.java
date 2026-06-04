package com.craftbeer.brewing.controller;

import com.craftbeer.brewing.common.Result;
import com.craftbeer.brewing.dto.TemperatureDataDTO;
import com.craftbeer.brewing.entity.FermentationTemperature;
import com.craftbeer.brewing.service.FermentationTemperatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 发酵温度Controller
 */
@RestController
@RequestMapping("/fermentation-temperatures")
@RequiredArgsConstructor
public class FermentationTemperatureController {

    private final FermentationTemperatureService fermentationTemperatureService;

    @GetMapping("/batch/{batchId}")
    public Result<List<FermentationTemperature>> getTemperatureCurve(@PathVariable Long batchId) {
        return Result.success(fermentationTemperatureService.getTemperatureCurve(batchId));
    }

    @GetMapping("/batch/{batchId}/range")
    public Result<List<FermentationTemperature>> getTemperatureByTimeRange(
            @PathVariable Long batchId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(fermentationTemperatureService.getTemperatureByTimeRange(batchId, startTime, endTime));
    }

    @PostMapping
    public Result<Void> add(@RequestBody TemperatureDataDTO temperatureDataDTO) {
        fermentationTemperatureService.addTemperatureRecord(temperatureDataDTO);
        return Result.success();
    }

    @PostMapping("/batch")
    public Result<Void> batchAdd(@RequestBody List<TemperatureDataDTO> temperatureDataDTOList) {
        fermentationTemperatureService.batchAddTemperatureRecords(temperatureDataDTOList);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        fermentationTemperatureService.removeById(id);
        return Result.success();
    }
}
