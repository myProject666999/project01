package com.tax.rebate.controller;

import com.tax.rebate.dto.PageRequest;
import com.tax.rebate.dto.PageResult;
import com.tax.rebate.dto.Result;
import com.tax.rebate.entity.TaxRate;
import com.tax.rebate.service.TaxRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/tax-rates")
@RequiredArgsConstructor
public class TaxRateController {

    private final TaxRateService taxRateService;

    @PostMapping("/import")
    public Result<Integer> importCsv(@RequestParam("file") MultipartFile file) {
        try {
            int count = taxRateService.importCsv(file);
            return Result.ok(count);
        } catch (Exception e) {
            return Result.fail("导入退税率失败: " + e.getMessage());
        }
    }

    @GetMapping
    public Result<PageResult<TaxRate>> pageQuery(PageRequest pageRequest) {
        return Result.ok(taxRateService.pageQuery(pageRequest));
    }

    @GetMapping("/{id}")
    public Result<TaxRate> getById(@PathVariable Long id) {
        return Result.ok(taxRateService.getById(id));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody TaxRate taxRate) {
        return Result.ok(taxRateService.save(taxRate));
    }

    @PutMapping("/{id}")
    public Result<Boolean> update(@PathVariable Long id, @RequestBody TaxRate taxRate) {
        taxRate.setId(id);
        return Result.ok(taxRateService.updateById(taxRate));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> deleteById(@PathVariable Long id) {
        return Result.ok(taxRateService.deleteById(id));
    }

    @GetMapping("/query")
    public Result<TaxRate> queryByHsCode(@RequestParam String hsCode) {
        return Result.ok(taxRateService.queryByHsCode(hsCode));
    }
}
