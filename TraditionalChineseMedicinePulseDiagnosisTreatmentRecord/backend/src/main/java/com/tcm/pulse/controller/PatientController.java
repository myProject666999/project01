package com.tcm.pulse.controller;

import com.tcm.pulse.common.PageResult;
import com.tcm.pulse.common.Result;
import com.tcm.pulse.dto.PatientDTO;
import com.tcm.pulse.entity.Patient;
import com.tcm.pulse.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "患者管理", description = "患者档案的增删改查")
@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @Operation(summary = "分页查询患者列表")
    @GetMapping
    public Result<PageResult<Patient>> findPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone) {
        return Result.success(patientService.findPage(pageNum, pageSize, name, phone));
    }

    @Operation(summary = "查询所有患者")
    @GetMapping("/all")
    public Result<List<Patient>> findAll() {
        return Result.success(patientService.findAll());
    }

    @Operation(summary = "根据ID查询患者")
    @GetMapping("/{id}")
    public Result<Patient> findById(@PathVariable Long id) {
        return Result.success(patientService.findById(id));
    }

    @Operation(summary = "新增患者")
    @PostMapping
    public Result<Patient> create(@Valid @RequestBody PatientDTO dto) {
        return Result.success(patientService.create(dto));
    }

    @Operation(summary = "更新患者")
    @PutMapping("/{id}")
    public Result<Patient> update(@PathVariable Long id, @Valid @RequestBody PatientDTO dto) {
        return Result.success(patientService.update(id, dto));
    }

    @Operation(summary = "删除患者")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        patientService.delete(id);
        return Result.success();
    }
}
