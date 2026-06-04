package com.judicial.appraisal.controller;

import com.judicial.appraisal.common.Result;
import com.judicial.appraisal.common.enums.EntrustmentStatus;
import com.judicial.appraisal.dto.EntrustmentCreateRequest;
import com.judicial.appraisal.entity.Client;
import com.judicial.appraisal.entity.Entrustment;
import com.judicial.appraisal.service.ClientService;
import com.judicial.appraisal.service.EntrustmentService;
import com.judicial.appraisal.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/entrustments")
public class EntrustmentController {

    @Autowired
    private EntrustmentService entrustmentService;

    @Autowired
    private ClientService clientService;

    @GetMapping
    public Result<List<Entrustment>> getEntrustments(@RequestParam(required = false) String status) {
        List<Entrustment> entrustments;
        if (status != null && !status.isEmpty()) {
            entrustments = entrustmentService.findByStatus(status);
        } else {
            entrustments = entrustmentService.findAll();
        }
        for (Entrustment e : entrustments) {
            if (e.getClientId() != null) {
                Client client = clientService.findById(e.getClientId());
                if (client != null) {
                    e.setClientName(client.getName());
                }
            }
        }
        return Result.success(entrustments);
    }

    @GetMapping("/{id}")
    public Result<Entrustment> getEntrustmentById(@PathVariable Long id) {
        Entrustment e = entrustmentService.findById(id);
        if (e != null && e.getClientId() != null) {
            Client client = clientService.findById(e.getClientId());
            if (client != null) {
                e.setClientName(client.getName());
            }
        }
        return Result.success(e);
    }

    @PostMapping
    public Result<Entrustment> createEntrustment(@Valid @RequestBody EntrustmentCreateRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error("用户未登录");
        }

        Entrustment entrustment = new Entrustment();
        entrustment.setCaseName(request.getCaseName());
        entrustment.setAppraisalType(request.getAppraisalType());
        entrustment.setAppraisalMatter(request.getAppraisalRequirements());
        entrustment.setCaseDescription(request.getCaseSummary());

        if (request.getEntrustDate() != null && !request.getEntrustDate().isEmpty()) {
            entrustment.setEntrustDate(LocalDate.parse(request.getEntrustDate(), DateTimeFormatter.ISO_LOCAL_DATE));
        } else {
            entrustment.setEntrustDate(LocalDate.now());
        }

        String entrustorName = request.getEntrustor();
        if (entrustorName != null && !entrustorName.isEmpty()) {
            Client client = clientService.findOrCreateByName(entrustorName, request.getPhone());
            entrustment.setClientId(client.getId());
        } else {
            return Result.error("委托人不能为空");
        }

        if (entrustment.getStatus() == null || entrustment.getStatus().isEmpty()) {
            entrustment.setStatus(EntrustmentStatus.REGISTERED.getCode());
        }

        Entrustment saved = entrustmentService.register(entrustment, userId);
        saved.setClientName(entrustorName);
        return Result.success(saved);
    }

    @PutMapping("/{id}")
    public Result<Entrustment> updateEntrustment(@PathVariable Long id, @Valid @RequestBody Entrustment entrustment) {
        entrustment.setId(id);
        return Result.success(entrustmentService.save(entrustment));
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        if (status == null || status.isEmpty()) {
            return Result.error("状态不能为空");
        }
        entrustmentService.updateStatus(id, status);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteEntrustment(@PathVariable Long id) {
        Entrustment entrustment = entrustmentService.findById(id);
        if (entrustment == null) {
            return Result.error("委托不存在");
        }
        entrustmentService.deleteById(id);
        return Result.success();
    }
}
