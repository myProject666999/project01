package com.tax.rebate.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tax.rebate.dto.DeclarationGenerateDTO;
import com.tax.rebate.dto.PageRequest;
import com.tax.rebate.dto.PageResult;
import com.tax.rebate.entity.*;
import com.tax.rebate.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeclarationService {

    private final DeclarationMapper declarationMapper;
    private final DeclarationDetailMapper declarationDetailMapper;
    private final DeclarationProgressMapper declarationProgressMapper;
    private final MatchingResultMapper matchingResultMapper;
    private final CustomsDeclarationMapper customsDeclarationMapper;
    private final VatInvoiceMapper vatInvoiceMapper;
    private final TaxRateMapper taxRateMapper;

    @Transactional
    public Declaration generate(DeclarationGenerateDTO dto) {
        LambdaQueryWrapper<MatchingResult> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MatchingResult::getStatus, "MATCHED");
        List<MatchingResult> matchedResults = matchingResultMapper.selectList(wrapper);

        if (matchedResults.isEmpty()) {
            throw new RuntimeException("没有已确认的匹配记录，无法生成申报单");
        }

        Declaration declaration = new Declaration();
        declaration.setDeclarationNo("SB" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        declaration.setPeriod(dto.getPeriod());
        declaration.setStatus("DRAFT");
        declaration.setCreatedBy(1L);

        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalTaxAmount = BigDecimal.ZERO;
        int sortOrder = 1;

        List<DeclarationDetail> details = new ArrayList<>();

        for (MatchingResult mr : matchedResults) {
            CustomsDeclaration customs = customsDeclarationMapper.selectById(mr.getCustomsId());
            VatInvoice invoice = vatInvoiceMapper.selectById(mr.getInvoiceId());

            if (customs == null || invoice == null) {
                continue;
            }

            DeclarationDetail detail = new DeclarationDetail();
            detail.setDeclarationId(0L);
            detail.setMatchingId(mr.getId());
            detail.setHsCode(customs.getHsCode());
            detail.setProductName(customs.getProductName());
            detail.setInvoiceAmount(invoice.getAmount());

            LambdaQueryWrapper<TaxRate> taxWrapper = new LambdaQueryWrapper<>();
            taxWrapper.eq(TaxRate::getHsCode, customs.getHsCode()).orderByDesc(TaxRate::getEffectiveDate).last("LIMIT 1");
            TaxRate taxRate = taxRateMapper.selectOne(taxWrapper);

            BigDecimal rate = taxRate != null ? taxRate.getTaxRate() : new BigDecimal("0.13");
            detail.setTaxRate(rate);
            BigDecimal taxAmount = invoice.getAmount().multiply(rate).setScale(2, RoundingMode.HALF_UP);
            detail.setTaxAmount(taxAmount);
            detail.setSortOrder(sortOrder++);

            totalAmount = totalAmount.add(invoice.getAmount());
            totalTaxAmount = totalTaxAmount.add(taxAmount);
            details.add(detail);
        }

        declaration.setTotalAmount(totalAmount);
        declaration.setTotalTaxAmount(totalTaxAmount);
        declarationMapper.insert(declaration);

        for (DeclarationDetail detail : details) {
            detail.setDeclarationId(declaration.getId());
            declarationDetailMapper.insert(detail);
        }

        createProgress(declaration.getId(), "数据录入", "COMPLETED", "匹配数据已录入");
        createProgress(declaration.getId(), "数据审核", "PENDING", null);
        createProgress(declaration.getId(), "正式申报", "PENDING", null);
        createProgress(declaration.getId(), "审批完成", "PENDING", null);

        return declaration;
    }

    private void createProgress(Long declarationId, String stepName, String status, String remark) {
        DeclarationProgress progress = new DeclarationProgress();
        progress.setDeclarationId(declarationId);
        progress.setStepName(stepName);
        progress.setStatus(status);
        progress.setRemark(remark);
        if ("COMPLETED".equals(status)) {
            progress.setOperatedAt(LocalDateTime.now());
        }
        declarationProgressMapper.insert(progress);
    }

    public PageResult<Declaration> list(PageRequest pageRequest) {
        Page<Declaration> page = new Page<>(pageRequest.getPage(), pageRequest.getSize());
        LambdaQueryWrapper<Declaration> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(pageRequest.getKeyword())) {
            wrapper.like(Declaration::getDeclarationNo, pageRequest.getKeyword())
                    .or().like(Declaration::getPeriod, pageRequest.getKeyword());
        }
        wrapper.orderByDesc(Declaration::getCreatedAt);
        Page<Declaration> result = declarationMapper.selectPage(page, wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), pageRequest.getPage(), pageRequest.getSize());
    }

    public Declaration getById(Long id) {
        return declarationMapper.selectById(id);
    }

    public List<DeclarationDetail> getDetails(Long declarationId) {
        LambdaQueryWrapper<DeclarationDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DeclarationDetail::getDeclarationId, declarationId).orderByAsc(DeclarationDetail::getSortOrder);
        return declarationDetailMapper.selectList(wrapper);
    }

    @Transactional
    public boolean submit(Long id) {
        Declaration declaration = declarationMapper.selectById(id);
        if (declaration == null) {
            return false;
        }
        declaration.setStatus("SUBMITTED");
        declaration.setSubmittedAt(LocalDateTime.now());
        declarationMapper.updateById(declaration);

        updateProgressStep(id, "数据审核", "COMPLETED", "数据审核通过");
        updateProgressStep(id, "正式申报", "IN_PROGRESS", "正在申报中");

        return true;
    }

    @Transactional
    public boolean updateStatus(Long id, String status) {
        Declaration declaration = declarationMapper.selectById(id);
        if (declaration == null) {
            return false;
        }
        declaration.setStatus(status);
        declarationMapper.updateById(declaration);

        if ("APPROVED".equals(status)) {
            updateProgressStep(id, "正式申报", "COMPLETED", "申报完成");
            updateProgressStep(id, "审批完成", "COMPLETED", "审批通过");
        }

        return true;
    }

    public List<DeclarationProgress> getProgress(Long declarationId) {
        LambdaQueryWrapper<DeclarationProgress> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DeclarationProgress::getDeclarationId, declarationId).orderByAsc(DeclarationProgress::getId);
        return declarationProgressMapper.selectList(wrapper);
    }

    private void updateProgressStep(Long declarationId, String stepName, String status, String remark) {
        LambdaQueryWrapper<DeclarationProgress> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DeclarationProgress::getDeclarationId, declarationId)
                .eq(DeclarationProgress::getStepName, stepName);
        DeclarationProgress progress = declarationProgressMapper.selectOne(wrapper);
        if (progress != null) {
            progress.setStatus(status);
            progress.setRemark(remark);
            progress.setOperatedAt(LocalDateTime.now());
            declarationProgressMapper.updateById(progress);
        }
    }
}
