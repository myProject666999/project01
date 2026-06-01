package com.maritime.pilotage.service;

import com.maritime.pilotage.dto.BillingCalculationRequestDTO;
import com.maritime.pilotage.dto.BillingCalculationResultDTO;
import com.maritime.pilotage.entity.PilotageBilling;

import java.math.BigDecimal;

public interface BillingCalculationService {

    BillingCalculationResultDTO calculateBilling(BillingCalculationRequestDTO request);

    PilotageBilling generateBilling(BillingCalculationRequestDTO request);

    BigDecimal calculateBaseFee(BigDecimal netTonnage);

    BigDecimal calculateTonnageFee(BigDecimal netTonnage);

    BigDecimal calculateDistanceFee(BigDecimal pilotageDistance);

    BigDecimal calculateSurcharges(BigDecimal baseAmount,
                                   Boolean isNight,
                                   Boolean isWeekend,
                                   Boolean isHoliday);

    String generateBillingNo();
}
