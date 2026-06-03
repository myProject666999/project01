package com.tax.rebate.controller;

import com.tax.rebate.dto.DeclarationGenerateDTO;
import com.tax.rebate.dto.PageRequest;
import com.tax.rebate.dto.PageResult;
import com.tax.rebate.dto.Result;
import com.tax.rebate.entity.Declaration;
import com.tax.rebate.entity.DeclarationDetail;
import com.tax.rebate.entity.DeclarationProgress;
import com.tax.rebate.service.DeclarationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/declarations")
@RequiredArgsConstructor
public class DeclarationController {

    private final DeclarationService declarationService;

    @PostMapping("/generate")
    public Result<Declaration> generate(@Valid @RequestBody DeclarationGenerateDTO dto) {
        try {
            return Result.ok(declarationService.generate(dto));
        } catch (Exception e) {
            return Result.fail("生成申报单失败: " + e.getMessage());
        }
    }

    @GetMapping
    public Result<PageResult<Declaration>> list(PageRequest pageRequest) {
        return Result.ok(declarationService.list(pageRequest));
    }

    @GetMapping("/{id}")
    public Result<Declaration> getById(@PathVariable Long id) {
        return Result.ok(declarationService.getById(id));
    }

    @GetMapping("/{id}/details")
    public Result<List<DeclarationDetail>> getDetails(@PathVariable Long id) {
        return Result.ok(declarationService.getDetails(id));
    }

    @PutMapping("/{id}/submit")
    public Result<Boolean> submit(@PathVariable Long id) {
        return Result.ok(declarationService.submit(id));
    }

    @PutMapping("/{id}/status")
    public Result<Boolean> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        return Result.ok(declarationService.updateStatus(id, status));
    }

    @GetMapping("/{id}/progress")
    public Result<List<DeclarationProgress>> getProgress(@PathVariable Long id) {
        return Result.ok(declarationService.getProgress(id));
    }
}
