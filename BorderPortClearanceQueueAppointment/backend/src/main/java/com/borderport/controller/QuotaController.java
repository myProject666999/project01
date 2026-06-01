package com.borderport.controller;

import com.borderport.common.Result;
import com.borderport.dto.QuotaAdjustDTO;
import com.borderport.entity.Quota;
import com.borderport.service.QuotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/quotas")
@RequiredArgsConstructor
public class QuotaController {

    private final QuotaService quotaService;

    @GetMapping("/{portId}")
    public Result<List> getQuotas(
            @PathVariable Long portId,
            @RequestParam String vehicleType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return Result.ok(quotaService.getQuotas(portId, vehicleType, date));
    }

    @PostMapping
    public Result<Quota> create(@RequestBody Quota quota) {
        return Result.ok(quotaService.createQuota(quota));
    }

    @PutMapping("/{id}")
    public Result<Quota> update(@PathVariable Long id, @RequestBody Quota quota) {
        return Result.ok(quotaService.updateQuota(id, quota));
    }

    @PostMapping("/adjust")
    public Result adjust(@RequestBody QuotaAdjustDTO dto) {
        quotaService.adjustQuota(dto);
        return Result.ok();
    }
}
