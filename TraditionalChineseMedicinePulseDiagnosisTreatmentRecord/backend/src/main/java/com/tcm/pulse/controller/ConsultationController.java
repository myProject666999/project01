package com.tcm.pulse.controller;

import com.tcm.pulse.common.PageResult;
import com.tcm.pulse.common.Result;
import com.tcm.pulse.dto.ConsultationDTO;
import com.tcm.pulse.entity.Consultation;
import com.tcm.pulse.service.ConsultationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "诊疗记录管理", description = "望闻问切四诊记录的增删改查")
@RestController
@RequestMapping("/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @Operation(summary = "分页查询诊疗记录")
    @GetMapping
    public Result<PageResult<Consultation>> findPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) String keyword) {
        return Result.success(consultationService.findPage(pageNum, pageSize, patientId, keyword));
    }

    @Operation(summary = "查询患者的所有诊疗记录")
    @GetMapping("/patient/{patientId}")
    public Result<List<Consultation>> findByPatientId(@PathVariable Long patientId) {
        return Result.success(consultationService.findByPatientId(patientId));
    }

    @Operation(summary = "根据ID查询诊疗记录")
    @GetMapping("/{id}")
    public Result<Consultation> findById(@PathVariable Long id) {
        return Result.success(consultationService.findById(id));
    }

    @Operation(summary = "新增诊疗记录")
    @PostMapping
    public Result<Consultation> create(@Valid @RequestBody ConsultationDTO dto) {
        return Result.success(consultationService.create(dto));
    }

    @Operation(summary = "更新诊疗记录")
    @PutMapping("/{id}")
    public Result<Consultation> update(@PathVariable Long id, @Valid @RequestBody ConsultationDTO dto) {
        return Result.success(consultationService.update(id, dto));
    }

    @Operation(summary = "删除诊疗记录")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        consultationService.delete(id);
        return Result.success();
    }
}
