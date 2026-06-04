package com.tcm.pulse.controller;

import com.tcm.pulse.common.PageResult;
import com.tcm.pulse.common.Result;
import com.tcm.pulse.dto.PrescriptionDTO;
import com.tcm.pulse.dto.ValidationResultDTO;
import com.tcm.pulse.entity.Prescription;
import com.tcm.pulse.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "处方管理", description = "处方开具、加味减味、复诊对比")
@RestController
@RequestMapping("/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @Operation(summary = "分页查询处方列表")
    @GetMapping
    public Result<PageResult<Prescription>> findPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) String doctorName) {
        return Result.success(prescriptionService.findPage(pageNum, pageSize, patientId, doctorName));
    }

    @Operation(summary = "查询患者的所有处方")
    @GetMapping("/patient/{patientId}")
    public Result<List<Prescription>> findByPatientId(@PathVariable Long patientId) {
        return Result.success(prescriptionService.findByPatientId(patientId));
    }

    @Operation(summary = "查询患者的处方用于对比")
    @GetMapping("/patient/{patientId}/comparison")
    public Result<List<Prescription>> findForComparison(@PathVariable Long patientId) {
        return Result.success(prescriptionService.findForComparison(patientId));
    }

    @Operation(summary = "根据ID查询处方基本信息")
    @GetMapping("/{id}")
    public Result<Prescription> findById(@PathVariable Long id) {
        return Result.success(prescriptionService.findById(id));
    }

    @Operation(summary = "根据ID查询处方详情（包含明细）")
    @GetMapping("/{id}/detail")
    public Result<Prescription> findDetailById(@PathVariable Long id) {
        return Result.success(prescriptionService.findDetailById(id));
    }

    @Operation(summary = "查询患者最新处方")
    @GetMapping("/patient/{patientId}/latest")
    public Result<Prescription> getLatestPrescription(@PathVariable Long patientId) {
        return Result.success(prescriptionService.getLatestPrescription(patientId));
    }

    @Operation(summary = "新增处方")
    @PostMapping
    public Result<Prescription> create(@Valid @RequestBody PrescriptionDTO dto) {
        return Result.success(prescriptionService.create(dto));
    }

    @Operation(summary = "更新处方")
    @PutMapping("/{id}")
    public Result<Prescription> update(@PathVariable Long id, @Valid @RequestBody PrescriptionDTO dto) {
        return Result.success(prescriptionService.update(id, dto));
    }

    @Operation(summary = "处方加味（在原方基础上添加药材）")
    @PostMapping("/{sourceId}/add-flavor")
    public Result<Prescription> addFlavor(
            @PathVariable Long sourceId,
            @Valid @RequestBody PrescriptionDTO dto) {
        return Result.success(prescriptionService.addFlavor(sourceId, dto));
    }

    @Operation(summary = "处方减味（在原方基础上减去药材）")
    @PostMapping("/{sourceId}/remove-flavor")
    public Result<Prescription> removeFlavor(
            @PathVariable Long sourceId,
            @Valid @RequestBody PrescriptionDTO dto) {
        return Result.success(prescriptionService.removeFlavor(sourceId, dto));
    }

    @Operation(summary = "删除处方")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        prescriptionService.delete(id);
        return Result.success();
    }

    @Operation(summary = "校验处方明细是否存在配伍禁忌")
    @PostMapping("/validate")
    public Result<List<ValidationResultDTO>> validatePrescription(@RequestBody PrescriptionDTO dto) {
        return Result.success(prescriptionService.validatePrescriptionItems(dto.getItems()));
    }
}
