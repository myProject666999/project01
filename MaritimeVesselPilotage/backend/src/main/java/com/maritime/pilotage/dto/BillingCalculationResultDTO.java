package com.maritime.pilotage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingCalculationResultDTO {

    private String billingNo;

    private Long orderId;

    private Long vesselId;

    private BigDecimal netTonnage;

    private BigDecimal pilotageDistance;

    private BigDecimal baseFee;

    private BigDecimal tonnageFee;

    private BigDecimal distanceFee;

    private BigDecimal tugFee;

    private BigDecimal nightSurcharge;

    private BigDecimal weekendSurcharge;

    private BigDecimal holidaySurcharge;

    private BigDecimal otherFee;

    private BigDecimal discount;

    private BigDecimal totalAmount;

    private String calculationDetail;
}
