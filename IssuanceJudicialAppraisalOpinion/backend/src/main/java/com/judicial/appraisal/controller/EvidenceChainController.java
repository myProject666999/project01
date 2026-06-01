package com.judicial.appraisal.controller;

import com.judicial.appraisal.common.Result;
import com.judicial.appraisal.entity.EvidenceChain;
import com.judicial.appraisal.service.EvidenceChainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evidence-chains")
public class EvidenceChainController {

    @Autowired
    private EvidenceChainService evidenceChainService;

    @GetMapping("/evidence/{evidenceId}")
    public Result<List<EvidenceChain>> getChainByEvidenceId(@PathVariable Long evidenceId) {
        List<EvidenceChain> chain = evidenceChainService.getChainByEvidenceId(evidenceId);
        return Result.success(chain);
    }

    @PostMapping("/record")
    public Result<EvidenceChain> recordOperation(@RequestBody Map<String, Object> request) {
        Long evidenceId = request.get("evidenceId") != null ? Long.valueOf(request.get("evidenceId").toString()) : null;
        String operationType = request.get("operationType") != null ? request.get("operationType").toString() : null;
        Long operatorId = request.get("operatorId") != null ? Long.valueOf(request.get("operatorId").toString()) : null;
        Long counterpartId = request.get("counterpartId") != null ? Long.valueOf(request.get("counterpartId").toString()) : null;
        String remark = request.get("remark") != null ? request.get("remark").toString() : null;

        if (evidenceId == null || operationType == null || operatorId == null) {
            return Result.error("检材ID、操作类型、操作人ID不能为空");
        }

        EvidenceChain chain = evidenceChainService.recordOperation(evidenceId, operationType, operatorId, counterpartId, remark);
        return Result.success(chain);
    }

    @PostMapping("/unseal")
    public Result<EvidenceChain> unseal(@RequestBody Map<String, Object> request) {
        Long evidenceId = request.get("evidenceId") != null ? Long.valueOf(request.get("evidenceId").toString()) : null;
        Long operatorId = request.get("operatorId") != null ? Long.valueOf(request.get("operatorId").toString()) : null;
        Long counterpartId = request.get("counterpartId") != null ? Long.valueOf(request.get("counterpartId").toString()) : null;
        String remark = request.get("remark") != null ? request.get("remark").toString() : null;

        if (evidenceId == null || operatorId == null) {
            return Result.error("检材ID、操作人ID不能为空");
        }

        EvidenceChain chain = evidenceChainService.unsealEvidence(evidenceId, operatorId, counterpartId, remark);
        return Result.success(chain);
    }

    @PostMapping("/seal")
    public Result<EvidenceChain> seal(@RequestBody Map<String, Object> request) {
        Long evidenceId = request.get("evidenceId") != null ? Long.valueOf(request.get("evidenceId").toString()) : null;
        Long operatorId = request.get("operatorId") != null ? Long.valueOf(request.get("operatorId").toString()) : null;
        Long counterpartId = request.get("counterpartId") != null ? Long.valueOf(request.get("counterpartId").toString()) : null;
        String remark = request.get("remark") != null ? request.get("remark").toString() : null;

        if (evidenceId == null || operatorId == null) {
            return Result.error("检材ID、操作人ID不能为空");
        }

        EvidenceChain chain = evidenceChainService.sealEvidence(evidenceId, operatorId, counterpartId, remark);
        return Result.success(chain);
    }

    @PostMapping("/transfer")
    public Result<EvidenceChain> transfer(@RequestBody Map<String, Object> request) {
        Long evidenceId = request.get("evidenceId") != null ? Long.valueOf(request.get("evidenceId").toString()) : null;
        Long operatorId = request.get("operatorId") != null ? Long.valueOf(request.get("operatorId").toString()) : null;
        Long counterpartId = request.get("counterpartId") != null ? Long.valueOf(request.get("counterpartId").toString()) : null;
        String remark = request.get("remark") != null ? request.get("remark").toString() : null;

        if (evidenceId == null || operatorId == null || counterpartId == null) {
            return Result.error("检材ID、操作人ID、交接方ID不能为空");
        }

        EvidenceChain chain = evidenceChainService.transferEvidence(evidenceId, operatorId, counterpartId, remark);
        return Result.success(chain);
    }
}
