package com.judicial.appraisal.controller;

import com.judicial.appraisal.common.Result;
import com.judicial.appraisal.common.enums.SealStatus;
import com.judicial.appraisal.dto.EvidenceReceiveRequest;
import com.judicial.appraisal.entity.Evidence;
import com.judicial.appraisal.service.EvidenceService;
import com.judicial.appraisal.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evidences")
public class EvidenceController {

    @Autowired
    private EvidenceService evidenceService;

    @GetMapping
    public Result<List<Evidence>> getList(
            @RequestParam(required = false) Long entrustmentId,
            @RequestParam(required = false) String sealStatus) {
        List<Evidence> list;
        if (entrustmentId != null && sealStatus != null) {
            list = evidenceService.findByEntrustmentIdAndSealStatus(entrustmentId, sealStatus);
        } else if (entrustmentId != null) {
            list = evidenceService.findByEntrustmentId(entrustmentId);
        } else if (sealStatus != null) {
            list = evidenceService.findBySealStatus(sealStatus);
        } else {
            list = evidenceService.findAll();
        }
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<Evidence> getDetail(@PathVariable Long id) {
        Evidence evidence = evidenceService.findById(id);
        if (evidence == null) {
            return Result.error("检材不存在");
        }
        return Result.success(evidence);
    }

    @PostMapping
    public Result<Evidence> receiveEvidence(@Valid @RequestBody EvidenceReceiveRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error("用户未登录");
        }

        Evidence evidence = new Evidence();
        evidence.setEntrustmentId(request.getEntrustmentId());
        evidence.setEvidenceName(request.getName());
        evidence.setEvidenceType(request.getType());
        evidence.setQuantity(request.getQuantity());
        evidence.setDescription(request.getDescription());
        evidence.setStorageLocation(request.getStorageLocation());

        if (request.getWeight() != null && !request.getWeight().isEmpty()) {
            try {
                evidence.setWeight(new BigDecimal(request.getWeight()));
            } catch (NumberFormatException ignored) {
            }
        }

        if (request.getSealedStatus() != null && !request.getSealedStatus().isEmpty()) {
            evidence.setSealStatus(request.getSealedStatus());
        } else {
            evidence.setSealStatus(SealStatus.SEALED.getCode());
        }

        Evidence saved = evidenceService.receiveEvidence(evidence, userId);
        return Result.success(saved);
    }

    @PutMapping("/{id}")
    public Result<Evidence> update(@PathVariable Long id, @RequestBody Evidence evidence) {
        Evidence updated = evidenceService.update(id, evidence);
        if (updated == null) {
            return Result.error("检材不存在");
        }
        return Result.success(updated);
    }

    @PutMapping("/{id}/seal-status")
    public Result<Void> updateSealStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String status = request.get("sealStatus");
        if (status == null) {
            return Result.error("封存状态不能为空");
        }
        evidenceService.updateSealStatus(id, status);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteById(@PathVariable Long id) {
        evidenceService.deleteById(id);
        return Result.success();
    }
}
