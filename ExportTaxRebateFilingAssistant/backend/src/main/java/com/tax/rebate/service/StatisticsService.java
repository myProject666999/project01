package com.tax.rebate.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tax.rebate.entity.CustomsDeclaration;
import com.tax.rebate.entity.DeclarationDetail;
import com.tax.rebate.entity.MatchingResult;
import com.tax.rebate.entity.VatInvoice;
import com.tax.rebate.mapper.CustomsDeclarationMapper;
import com.tax.rebate.mapper.DeclarationDetailMapper;
import com.tax.rebate.mapper.MatchingResultMapper;
import com.tax.rebate.mapper.VatInvoiceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final CustomsDeclarationMapper customsDeclarationMapper;
    private final VatInvoiceMapper vatInvoiceMapper;
    private final MatchingResultMapper matchingResultMapper;
    private final DeclarationDetailMapper declarationDetailMapper;

    public Map<String, Object> dashboard() {
        Map<String, Object> data = new HashMap<>();

        Long totalCustoms = customsDeclarationMapper.selectCount(null);
        Long totalInvoices = vatInvoiceMapper.selectCount(null);

        Long matchedCount = matchingResultMapper.selectCount(
                new LambdaQueryWrapper<MatchingResult>()
                        .eq(MatchingResult::getStatus, "MATCHED"));

        Long suspectedCount = matchingResultMapper.selectCount(
                new LambdaQueryWrapper<MatchingResult>()
                        .eq(MatchingResult::getStatus, "SUSPECTED"));

        Long pendingCustoms = customsDeclarationMapper.selectCount(
                new LambdaQueryWrapper<CustomsDeclaration>()
                        .eq(CustomsDeclaration::getStatus, "PENDING"));

        Long pendingInvoices = vatInvoiceMapper.selectCount(
                new LambdaQueryWrapper<VatInvoice>()
                        .eq(VatInvoice::getStatus, "PENDING"));

        List<Map<String, Object>> matchingStatus = new ArrayList<>();
        Map<String, Object> matchedMap = new HashMap<>();
        matchedMap.put("name", "已匹配");
        matchedMap.put("value", matchedCount);
        matchedMap.put("color", "#10B981");
        matchingStatus.add(matchedMap);

        Map<String, Object> suspectedMap = new HashMap<>();
        suspectedMap.put("name", "待确认");
        suspectedMap.put("value", suspectedCount);
        suspectedMap.put("color", "#F59E0B");
        matchingStatus.add(suspectedMap);

        Map<String, Object> pendingMap = new HashMap<>();
        pendingMap.put("name", "待匹配");
        pendingMap.put("value", pendingCustoms + pendingInvoices);
        pendingMap.put("color", "#EF4444");
        matchingStatus.add(pendingMap);

        List<Map<String, Object>> todoItems = new ArrayList<>();
        if (pendingCustoms > 0) {
            Map<String, Object> todo1 = new HashMap<>();
            todo1.put("id", 1);
            todo1.put("title", pendingCustoms + "份报关单待匹配");
            todo1.put("type", "customs");
            todo1.put("createdAt", java.time.LocalDateTime.now().toString());
            todoItems.add(todo1);
        }
        if (pendingInvoices > 0) {
            Map<String, Object> todo2 = new HashMap<>();
            todo2.put("id", 2);
            todo2.put("title", pendingInvoices + "份发票待匹配");
            todo2.put("type", "invoice");
            todo2.put("createdAt", java.time.LocalDateTime.now().toString());
            todoItems.add(todo2);
        }
        if (suspectedCount > 0) {
            Map<String, Object> todo3 = new HashMap<>();
            todo3.put("id", 3);
            todo3.put("title", suspectedCount + "条匹配待确认");
            todo3.put("type", "suspected");
            todo3.put("createdAt", java.time.LocalDateTime.now().toString());
            todoItems.add(todo3);
        }

        BigDecimal totalRebateAmount = BigDecimal.ZERO;
        List<DeclarationDetail> details = declarationDetailMapper.selectList(null);
        for (DeclarationDetail detail : details) {
            totalRebateAmount = totalRebateAmount.add(detail.getTaxAmount());
        }

        data.put("customsCount", totalCustoms);
        data.put("invoiceCount", totalInvoices);
        data.put("matchedCount", matchedCount);
        data.put("totalRebateAmount", totalRebateAmount.doubleValue());
        data.put("matchingStatus", matchingStatus);
        data.put("todoItems", todoItems);

        return data;
    }

    public Map<String, Object> matchingStatusStats() {
        Map<String, Object> data = new HashMap<>();

        Long pendingCustoms = customsDeclarationMapper.selectCount(
                new LambdaQueryWrapper<CustomsDeclaration>()
                        .eq(CustomsDeclaration::getStatus, "PENDING"));
        Long matchedCustoms = customsDeclarationMapper.selectCount(
                new LambdaQueryWrapper<CustomsDeclaration>()
                        .eq(CustomsDeclaration::getStatus, "MATCHED"));
        Long suspectedCustoms = customsDeclarationMapper.selectCount(
                new LambdaQueryWrapper<CustomsDeclaration>()
                        .eq(CustomsDeclaration::getStatus, "SUSPECTED"));

        Long pendingInvoices = vatInvoiceMapper.selectCount(
                new LambdaQueryWrapper<VatInvoice>()
                        .eq(VatInvoice::getStatus, "PENDING"));
        Long matchedInvoices = vatInvoiceMapper.selectCount(
                new LambdaQueryWrapper<VatInvoice>()
                        .eq(VatInvoice::getStatus, "MATCHED"));
        Long suspectedInvoices = vatInvoiceMapper.selectCount(
                new LambdaQueryWrapper<VatInvoice>()
                        .eq(VatInvoice::getStatus, "SUSPECTED"));

        data.put("customsPending", pendingCustoms);
        data.put("customsMatched", matchedCustoms);
        data.put("customsSuspected", suspectedCustoms);
        data.put("invoicePending", pendingInvoices);
        data.put("invoiceMatched", matchedInvoices);
        data.put("invoiceSuspected", suspectedInvoices);

        return data;
    }
}
