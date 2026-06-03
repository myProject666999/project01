package com.tax.rebate.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tax.rebate.dto.PageRequest;
import com.tax.rebate.dto.PageResult;
import com.tax.rebate.entity.MatchingResult;
import com.tax.rebate.entity.MatchingRule;
import com.tax.rebate.entity.CustomsDeclaration;
import com.tax.rebate.entity.VatInvoice;
import com.tax.rebate.dto.ManualMatchDTO;
import com.tax.rebate.dto.MatchRuleUpdateDTO;
import com.tax.rebate.mapper.MatchingResultMapper;
import com.tax.rebate.mapper.MatchingRuleMapper;
import com.tax.rebate.mapper.CustomsDeclarationMapper;
import com.tax.rebate.mapper.VatInvoiceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final MatchingResultMapper matchingResultMapper;
    private final MatchingRuleMapper matchingRuleMapper;
    private final CustomsDeclarationMapper customsDeclarationMapper;
    private final VatInvoiceMapper vatInvoiceMapper;

    @Transactional
    public int autoMatch() {
        LambdaQueryWrapper<CustomsDeclaration> customsWrapper = new LambdaQueryWrapper<>();
        customsWrapper.eq(CustomsDeclaration::getStatus, "PENDING");
        List<CustomsDeclaration> customsList = customsDeclarationMapper.selectList(customsWrapper);

        LambdaQueryWrapper<VatInvoice> invoiceWrapper = new LambdaQueryWrapper<>();
        invoiceWrapper.eq(VatInvoice::getStatus, "PENDING");
        List<VatInvoice> invoiceList = vatInvoiceMapper.selectList(invoiceWrapper);

        MatchingRule rule = getActiveRule();
        BigDecimal nameThreshold = rule.getNameSimilarityThreshold();
        BigDecimal amountTolerance = rule.getAmountToleranceRate();
        BigDecimal quantityTolerance = rule.getQuantityToleranceRate();

        List<Long> matchedInvoiceIds = new ArrayList<>();
        int matchCount = 0;

        for (CustomsDeclaration customs : customsList) {
            VatInvoice bestInvoice = null;
            double bestScore = 0;

            for (VatInvoice invoice : invoiceList) {
                if (matchedInvoiceIds.contains(invoice.getId())) {
                    continue;
                }

                double nameSimilarity = StrUtil.similar(customs.getProductName(), invoice.getProductName());

                BigDecimal amountCny = customs.getAmountCny();
                BigDecimal amountDiffRate = BigDecimal.ZERO;
                if (amountCny != null && amountCny.compareTo(BigDecimal.ZERO) > 0) {
                    amountDiffRate = amountCny.subtract(invoice.getAmount()).abs()
                            .divide(amountCny, 4, RoundingMode.HALF_UP);
                }

                BigDecimal quantity = customs.getQuantity();
                BigDecimal quantityDiffRate = BigDecimal.ZERO;
                if (quantity != null && quantity.compareTo(BigDecimal.ZERO) > 0) {
                    quantityDiffRate = quantity.subtract(invoice.getQuantity()).abs()
                            .divide(quantity, 4, RoundingMode.HALF_UP);
                }

                boolean nameOk = nameSimilarity >= nameThreshold.doubleValue();
                boolean amountOk = amountDiffRate.compareTo(amountTolerance) <= 0;
                boolean quantityOk = quantityDiffRate.compareTo(quantityTolerance) <= 0;

                if (nameOk && amountOk && quantityOk) {
                    double matchScore = nameSimilarity * 0.5
                            + (1 - amountDiffRate.doubleValue()) * 0.3
                            + (1 - quantityDiffRate.doubleValue()) * 0.2;
                    matchScore = Math.round(matchScore * 10000.0) / 100.0;

                    if (matchScore > bestScore) {
                        bestScore = matchScore;
                        bestInvoice = invoice;
                    }
                }
            }

            if (bestInvoice != null) {
                MatchingResult result = new MatchingResult();
                result.setCustomsId(customs.getId());
                result.setInvoiceId(bestInvoice.getId());
                result.setMatchScore(bestScore);
                result.setMatchType("AUTO");

                if (bestScore >= 80) {
                    result.setStatus("MATCHED");
                    customs.setStatus("MATCHED");
                    bestInvoice.setStatus("MATCHED");
                } else {
                    result.setStatus("SUSPECTED");
                    customs.setStatus("SUSPECTED");
                    bestInvoice.setStatus("SUSPECTED");
                }

                matchingResultMapper.insert(result);
                customsDeclarationMapper.updateById(customs);
                vatInvoiceMapper.updateById(bestInvoice);
                matchedInvoiceIds.add(bestInvoice.getId());
                matchCount++;
            }
        }

        return matchCount;
    }

    public PageResult<MatchingResult> getResults(PageRequest pageRequest) {
        Page<MatchingResult> page = new Page<>(pageRequest.getPage(), pageRequest.getSize());
        LambdaQueryWrapper<MatchingResult> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(pageRequest.getKeyword())) {
            wrapper.like(MatchingResult::getRemark, pageRequest.getKeyword());
        }
        wrapper.orderByDesc(MatchingResult::getCreatedAt);
        Page<MatchingResult> result = matchingResultMapper.selectPage(page, wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal(), pageRequest.getPage(), pageRequest.getSize());
    }

    public List<CustomsDeclaration> getUnmatchedCustoms() {
        LambdaQueryWrapper<CustomsDeclaration> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CustomsDeclaration::getStatus, "PENDING")
                .or().eq(CustomsDeclaration::getStatus, "SUSPECTED");
        return customsDeclarationMapper.selectList(wrapper);
    }

    public List<VatInvoice> getUnmatchedInvoices() {
        LambdaQueryWrapper<VatInvoice> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(VatInvoice::getStatus, "PENDING")
                .or().eq(VatInvoice::getStatus, "SUSPECTED");
        return vatInvoiceMapper.selectList(wrapper);
    }

    @Transactional
    public boolean manualMatch(ManualMatchDTO dto) {
        CustomsDeclaration customs = customsDeclarationMapper.selectById(dto.getCustomsId());
        VatInvoice invoice = vatInvoiceMapper.selectById(dto.getInvoiceId());

        if (customs == null || invoice == null) {
            return false;
        }

        double nameSimilarity = StrUtil.similar(customs.getProductName(), invoice.getProductName());
        double matchScore = Math.round(nameSimilarity * 10000.0) / 100.0;

        MatchingResult result = new MatchingResult();
        result.setCustomsId(customs.getId());
        result.setInvoiceId(invoice.getId());
        result.setMatchScore(matchScore);
        result.setMatchType("MANUAL");
        result.setStatus("MATCHED");
        matchingResultMapper.insert(result);

        customs.setStatus("MATCHED");
        invoice.setStatus("MATCHED");
        customsDeclarationMapper.updateById(customs);
        vatInvoiceMapper.updateById(invoice);

        return true;
    }

    @Transactional
    public boolean confirm(Long id) {
        MatchingResult result = matchingResultMapper.selectById(id);
        if (result == null) {
            return false;
        }
        result.setStatus("MATCHED");
        result.setConfirmedAt(LocalDateTime.now());
        matchingResultMapper.updateById(result);

        CustomsDeclaration customs = customsDeclarationMapper.selectById(result.getCustomsId());
        VatInvoice invoice = vatInvoiceMapper.selectById(result.getInvoiceId());
        if (customs != null) {
            customs.setStatus("MATCHED");
            customsDeclarationMapper.updateById(customs);
        }
        if (invoice != null) {
            invoice.setStatus("MATCHED");
            vatInvoiceMapper.updateById(invoice);
        }
        return true;
    }

    @Transactional
    public boolean reject(Long id) {
        MatchingResult result = matchingResultMapper.selectById(id);
        if (result == null) {
            return false;
        }
        result.setStatus("REJECTED");
        matchingResultMapper.updateById(result);

        CustomsDeclaration customs = customsDeclarationMapper.selectById(result.getCustomsId());
        VatInvoice invoice = vatInvoiceMapper.selectById(result.getInvoiceId());
        if (customs != null) {
            customs.setStatus("PENDING");
            customsDeclarationMapper.updateById(customs);
        }
        if (invoice != null) {
            invoice.setStatus("PENDING");
            vatInvoiceMapper.updateById(invoice);
        }
        return true;
    }

    public MatchingRule getActiveRule() {
        LambdaQueryWrapper<MatchingRule> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MatchingRule::getEnabled, true).orderByAsc(MatchingRule::getId).last("LIMIT 1");
        MatchingRule rule = matchingRuleMapper.selectOne(wrapper);
        if (rule == null) {
            rule = new MatchingRule();
            rule.setRuleName("默认规则");
            rule.setNameSimilarityThreshold(new BigDecimal("0.70"));
            rule.setAmountToleranceRate(new BigDecimal("0.05"));
            rule.setQuantityToleranceRate(new BigDecimal("0.05"));
            rule.setEnabled(true);
            matchingRuleMapper.insert(rule);
        }
        return rule;
    }

    public boolean updateRule(Long id, MatchRuleUpdateDTO dto) {
        MatchingRule rule = matchingRuleMapper.selectById(id);
        if (rule == null) {
            return false;
        }
        if (dto.getRuleName() != null) {
            rule.setRuleName(dto.getRuleName());
        }
        if (dto.getNameSimilarityThreshold() != null) {
            rule.setNameSimilarityThreshold(dto.getNameSimilarityThreshold());
        }
        if (dto.getAmountToleranceRate() != null) {
            rule.setAmountToleranceRate(dto.getAmountToleranceRate());
        }
        if (dto.getQuantityToleranceRate() != null) {
            rule.setQuantityToleranceRate(dto.getQuantityToleranceRate());
        }
        if (dto.getEnabled() != null) {
            rule.setEnabled(dto.getEnabled());
        }
        return matchingRuleMapper.updateById(rule) > 0;
    }
}
