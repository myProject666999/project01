package com.tax.rebate.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MatchRuleUpdateDTO {

    private String ruleName;
    private BigDecimal nameSimilarityThreshold;
    private BigDecimal amountToleranceRate;
    private BigDecimal quantityToleranceRate;
    private Boolean enabled;
}
