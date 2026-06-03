package com.tax.rebate.controller;

import com.tax.rebate.dto.PageRequest;
import com.tax.rebate.dto.PageResult;
import com.tax.rebate.dto.Result;
import com.tax.rebate.entity.VatInvoice;
import com.tax.rebate.service.VatInvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/vat-invoices")
@RequiredArgsConstructor
public class VatInvoiceController {

    private final VatInvoiceService vatInvoiceService;

    @PostMapping("/import")
    public Result<Integer> importCsv(@RequestParam("file") MultipartFile file) {
        try {
            int count = vatInvoiceService.importCsv(file);
            return Result.ok(count);
        } catch (Exception e) {
            return Result.fail("导入增值税发票失败: " + e.getMessage());
        }
    }

    @GetMapping
    public Result<PageResult<VatInvoice>> pageQuery(PageRequest pageRequest) {
        return Result.ok(vatInvoiceService.pageQuery(pageRequest));
    }

    @GetMapping("/{id}")
    public Result<VatInvoice> getById(@PathVariable Long id) {
        return Result.ok(vatInvoiceService.getById(id));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> deleteById(@PathVariable Long id) {
        return Result.ok(vatInvoiceService.deleteById(id));
    }
}
