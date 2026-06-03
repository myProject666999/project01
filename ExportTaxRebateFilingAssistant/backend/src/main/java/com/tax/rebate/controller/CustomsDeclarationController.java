package com.tax.rebate.controller;

import com.tax.rebate.dto.PageRequest;
import com.tax.rebate.dto.PageResult;
import com.tax.rebate.dto.Result;
import com.tax.rebate.entity.CustomsDeclaration;
import com.tax.rebate.service.CustomsDeclarationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/customs-declarations")
@RequiredArgsConstructor
public class CustomsDeclarationController {

    private final CustomsDeclarationService customsDeclarationService;

    @PostMapping("/import")
    public Result<Integer> importCsv(@RequestParam("file") MultipartFile file) {
        try {
            int count = customsDeclarationService.importCsv(file);
            return Result.ok(count);
        } catch (Exception e) {
            return Result.fail("导入报关单失败: " + e.getMessage());
        }
    }

    @GetMapping
    public Result<PageResult<CustomsDeclaration>> pageQuery(PageRequest pageRequest) {
        return Result.ok(customsDeclarationService.pageQuery(pageRequest));
    }

    @GetMapping("/{id}")
    public Result<CustomsDeclaration> getById(@PathVariable Long id) {
        return Result.ok(customsDeclarationService.getById(id));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> deleteById(@PathVariable Long id) {
        return Result.ok(customsDeclarationService.deleteById(id));
    }
}
