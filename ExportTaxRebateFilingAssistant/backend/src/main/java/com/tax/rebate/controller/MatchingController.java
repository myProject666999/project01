package com.tax.rebate.controller;

import com.tax.rebate.dto.*;
import com.tax.rebate.entity.CustomsDeclaration;
import com.tax.rebate.entity.MatchingResult;
import com.tax.rebate.entity.MatchingRule;
import com.tax.rebate.entity.VatInvoice;
import com.tax.rebate.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/matching")
@RequiredArgsConstructor
public class MatchingController {

    private final MatchingService matchingService;

    @PostMapping("/auto")
    public Result<Integer> autoMatch() {
        int count = matchingService.autoMatch();
        return Result.ok(count);
    }

    @GetMapping("/results")
    public Result<PageResult<MatchingResult>> getResults(PageRequest pageRequest) {
        return Result.ok(matchingService.getResults(pageRequest));
    }

    @GetMapping("/unmatched/customs")
    public Result<List<CustomsDeclaration>> getUnmatchedCustoms() {
        return Result.ok(matchingService.getUnmatchedCustoms());
    }

    @GetMapping("/unmatched/invoices")
    public Result<List<VatInvoice>> getUnmatchedInvoices() {
        return Result.ok(matchingService.getUnmatchedInvoices());
    }

    @PostMapping("/manual")
    public Result<Boolean> manualMatch(@Valid @RequestBody ManualMatchDTO dto) {
        return Result.ok(matchingService.manualMatch(dto));
    }

    @PutMapping("/{id}/confirm")
    public Result<Boolean> confirm(@PathVariable Long id) {
        return Result.ok(matchingService.confirm(id));
    }

    @PutMapping("/{id}/reject")
    public Result<Boolean> reject(@PathVariable Long id) {
        return Result.ok(matchingService.reject(id));
    }

    @GetMapping("/rules")
    public Result<MatchingRule> getRules() {
        return Result.ok(matchingService.getActiveRule());
    }

    @PutMapping("/rules")
    public Result<Boolean> updateRule(@RequestBody MatchRuleUpdateDTO dto) {
        MatchingRule rule = matchingService.getActiveRule();
        return Result.ok(matchingService.updateRule(rule.getId(), dto));
    }
}
