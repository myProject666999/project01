package com.tcm.pulse.controller;

import com.tcm.pulse.common.Result;
import com.tcm.pulse.dto.PrescriptionDTO;
import com.tcm.pulse.dto.PrescriptionItemDTO;
import com.tcm.pulse.dto.ValidationResultDTO;
import com.tcm.pulse.entity.CompatibilityRule;
import com.tcm.pulse.service.CompatibilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Tag(name = "配伍禁忌管理", description = "十八反十九畏的查询和校验")
@RestController
@RequestMapping("/compatibility")
@RequiredArgsConstructor
public class CompatibilityController {

    private final CompatibilityService compatibilityService;

    @Operation(summary = "校验两味药是否存在配伍禁忌")
    @GetMapping("/validate")
    public Result<ValidationResultDTO> validatePair(
            @RequestParam String herb1,
            @RequestParam String herb2) {
        return Result.success(compatibilityService.validatePair(herb1, herb2));
    }

    @Operation(summary = "校验处方中所有药材是否存在配伍禁忌")
    @PostMapping("/validate-prescription")
    public Result<List<ValidationResultDTO>> validatePrescription(
            @RequestBody List<String> herbNames) {
        return Result.success(compatibilityService.validatePrescription(herbNames));
    }

    @Operation(summary = "校验处方明细是否存在配伍禁忌")
    @PostMapping("/validate-items")
    public Result<List<ValidationResultDTO>> validateItems(
            @RequestBody List<PrescriptionItemDTO> items) {
        List<String> herbNames = items.stream()
                .map(PrescriptionItemDTO::getHerbName)
                .collect(Collectors.toList());
        return Result.success(compatibilityService.validatePrescription(herbNames));
    }

    @Operation(summary = "查询所有配伍禁忌规则")
    @GetMapping("/rules")
    public Result<List<CompatibilityRule>> getAllRules() {
        return Result.success(compatibilityService.getAllRules());
    }

    @Operation(summary = "查询十八反规则")
    @GetMapping("/rules/eighteen")
    public Result<List<CompatibilityRule>> getEighteenIncompatibilities() {
        return Result.success(compatibilityService.getEighteenIncompatibilities());
    }

    @Operation(summary = "查询十九畏规则")
    @GetMapping("/rules/nineteen")
    public Result<List<CompatibilityRule>> getNineteenMutualRestraints() {
        return Result.success(compatibilityService.getNineteenMutualRestraints());
    }
}
