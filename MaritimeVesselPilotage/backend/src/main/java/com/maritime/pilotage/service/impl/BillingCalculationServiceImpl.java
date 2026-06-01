package com.maritime.pilotage.service.impl;

import com.maritime.pilotage.dto.BillingCalculationRequestDTO;
import com.maritime.pilotage.dto.BillingCalculationResultDTO;
import com.maritime.pilotage.entity.PilotageBilling;
import com.maritime.pilotage.mapper.PilotageBillingMapper;
import com.maritime.pilotage.service.BillingCalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoField;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingCalculationServiceImpl implements BillingCalculationService {

    private static final BigDecimal BASE_FEE = new BigDecimal("200");
    private static final BigDecimal TONNAGE_RATE = new BigDecimal("0.5");
    private static final BigDecimal DISTANCE_RATE = new BigDecimal("10");
    private static final BigDecimal NIGHT_SURCHARGE_RATE = new BigDecimal("0.2");
    private static final BigDecimal WEEKEND_SURCHARGE_RATE = new BigDecimal("0.15");
    private static final BigDecimal HOLIDAY_SURCHARGE_RATE = new BigDecimal("0.3");
    private static final BigDecimal MIN_TONNAGE_THRESHOLD = new BigDecimal("1000");
    private static final BigDecimal MAX_TONNAGE_THRESHOLD = new BigDecimal("50000");
    private static final int SCALE = 2;
    private static final LocalTime NIGHT_START = LocalTime.of(22, 0);
    private static final LocalTime NIGHT_END = LocalTime.of(6, 0);

    private final PilotageBillingMapper billingMapper;

    @Override
    @Transactional
    public BillingCalculationResultDTO calculateBilling(BillingCalculationRequestDTO request) {
        BigDecimal baseFee = calculateBaseFee(request.getNetTonnage());
        BigDecimal tonnageFee = calculateTonnageFee(request.getNetTonnage());
        BigDecimal distanceFee = calculateDistanceFee(request.getPilotageDistance());

        BigDecimal baseTotal = baseFee.add(tonnageFee).add(distanceFee);

        boolean isNight = request.getIsNightSurcharge() != null ?
                request.getIsNightSurcharge() : isNightTime(request.getPilotageStartTime());
        boolean isWeekend = request.getIsWeekendSurcharge() != null ?
                request.getIsWeekendSurcharge() : isWeekend(request.getPilotageStartTime());
        boolean isHoliday = request.getIsHolidaySurcharge() != null ?
                request.getIsHolidaySurcharge() : false;

        BigDecimal nightSurcharge = isNight ?
                baseTotal.multiply(NIGHT_SURCHARGE_RATE).setScale(SCALE, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal weekendSurcharge = isWeekend ?
                baseTotal.multiply(WEEKEND_SURCHARGE_RATE).setScale(SCALE, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal holidaySurcharge = isHoliday ?
                baseTotal.multiply(HOLIDAY_SURCHARGE_RATE).setScale(SCALE, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        BigDecimal tugFee = request.getTugFee() != null ? request.getTugFee() : BigDecimal.ZERO;
        BigDecimal otherFee = request.getOtherFee() != null ? request.getOtherFee() : BigDecimal.ZERO;
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;

        BigDecimal totalAmount = baseTotal
                .add(nightSurcharge)
                .add(weekendSurcharge)
                .add(holidaySurcharge)
                .add(tugFee)
                .add(otherFee)
                .subtract(discount);

        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }
        totalAmount = totalAmount.setScale(SCALE, RoundingMode.HALF_UP);

        String billingNo = generateBillingNo();

        StringBuilder detailBuilder = new StringBuilder();
        detailBuilder.append("费用明细:\n");
        detailBuilder.append(String.format("基础费: ¥%s\n", baseFee));
        detailBuilder.append(String.format("吨位费(净吨位%s吨 × ¥%s): ¥%s\n",
                request.getNetTonnage(), TONNAGE_RATE, tonnageFee));
        detailBuilder.append(String.format("距离费(%s海里 × ¥%s): ¥%s\n",
                request.getPilotageDistance(), DISTANCE_RATE, distanceFee));
        if (nightSurcharge.compareTo(BigDecimal.ZERO) > 0) {
            detailBuilder.append(String.format("夜间附加费(+%d%%): ¥%s\n",
                    NIGHT_SURCHARGE_RATE.multiply(new BigDecimal("100")).intValue(), nightSurcharge));
        }
        if (weekendSurcharge.compareTo(BigDecimal.ZERO) > 0) {
            detailBuilder.append(String.format("周末附加费(+%d%%): ¥%s\n",
                    WEEKEND_SURCHARGE_RATE.multiply(new BigDecimal("100")).intValue(), weekendSurcharge));
        }
        if (holidaySurcharge.compareTo(BigDecimal.ZERO) > 0) {
            detailBuilder.append(String.format("节假日附加费(+%d%%): ¥%s\n",
                    HOLIDAY_SURCHARGE_RATE.multiply(new BigDecimal("100")).intValue(), holidaySurcharge));
        }
        if (tugFee.compareTo(BigDecimal.ZERO) > 0) {
            detailBuilder.append(String.format("拖轮费: ¥%s\n", tugFee));
        }
        if (otherFee.compareTo(BigDecimal.ZERO) > 0) {
            detailBuilder.append(String.format("其他费用: ¥%s\n", otherFee));
        }
        if (discount.compareTo(BigDecimal.ZERO) > 0) {
            detailBuilder.append(String.format("折扣: -¥%s\n", discount));
        }
        detailBuilder.append(String.format("合计: ¥%s", totalAmount));

        return BillingCalculationResultDTO.builder()
                .billingNo(billingNo)
                .orderId(request.getOrderId())
                .vesselId(request.getVesselId())
                .netTonnage(request.getNetTonnage())
                .pilotageDistance(request.getPilotageDistance())
                .baseFee(baseFee)
                .tonnageFee(tonnageFee)
                .distanceFee(distanceFee)
                .tugFee(tugFee)
                .nightSurcharge(nightSurcharge)
                .weekendSurcharge(weekendSurcharge)
                .holidaySurcharge(holidaySurcharge)
                .otherFee(otherFee)
                .discount(discount)
                .totalAmount(totalAmount)
                .calculationDetail(detailBuilder.toString())
                .build();
    }

    @Override
    @Transactional
    public PilotageBilling generateBilling(BillingCalculationRequestDTO request) {
        BillingCalculationResultDTO result = calculateBilling(request);

        PilotageBilling billing = PilotageBilling.builder()
                .billingNo(result.getBillingNo())
                .completionId(request.getCompletionId())
                .orderId(request.getOrderId())
                .vesselId(request.getVesselId())
                .netTonnage(request.getNetTonnage())
                .pilotageDistance(request.getPilotageDistance())
                .baseFee(result.getBaseFee())
                .tonnageFee(result.getTonnageFee())
                .distanceFee(result.getDistanceFee())
                .tugFee(result.getTugFee())
                .nightSurcharge(result.getNightSurcharge())
                .weekendSurcharge(result.getWeekendSurcharge())
                .holidaySurcharge(result.getHolidaySurcharge())
                .otherFee(result.getOtherFee())
                .discount(result.getDiscount())
                .totalAmount(result.getTotalAmount())
                .billingStatus(1)
                .billingDate(LocalDate.now())
                .remark(result.getCalculationDetail())
                .build();

        billingMapper.insert(billing);
        log.info("已生成账单: {}, 订单ID: {}, 总金额: {}",
                billing.getBillingNo(), billing.getOrderId(), billing.getTotalAmount());

        return billing;
    }

    @Override
    public BigDecimal calculateBaseFee(BigDecimal netTonnage) {
        BigDecimal tonnageForCalc = netTonnage.max(MIN_TONNAGE_THRESHOLD);
        tonnageForCalc = tonnageForCalc.min(MAX_TONNAGE_THRESHOLD);

        BigDecimal tierMultiplier;
        if (tonnageForCalc.compareTo(new BigDecimal("10000")) >= 0) {
            tierMultiplier = new BigDecimal("2");
        } else if (tonnageForCalc.compareTo(new BigDecimal("5000")) >= 0) {
            tierMultiplier = new BigDecimal("1.5");
        } else {
            tierMultiplier = BigDecimal.ONE;
        }

        return BASE_FEE.multiply(tierMultiplier).setScale(SCALE, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateTonnageFee(BigDecimal netTonnage) {
        BigDecimal tonnageForCalc = netTonnage.max(MIN_TONNAGE_THRESHOLD);
        tonnageForCalc = tonnageForCalc.min(MAX_TONNAGE_THRESHOLD);

        return tonnageForCalc.multiply(TONNAGE_RATE).setScale(SCALE, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateDistanceFee(BigDecimal pilotageDistance) {
        return pilotageDistance.multiply(DISTANCE_RATE).setScale(SCALE, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateSurcharges(BigDecimal baseAmount, Boolean isNight, Boolean isWeekend, Boolean isHoliday) {
        BigDecimal totalSurcharge = BigDecimal.ZERO;

        if (Boolean.TRUE.equals(isNight)) {
            totalSurcharge = totalSurcharge.add(baseAmount.multiply(NIGHT_SURCHARGE_RATE));
        }
        if (Boolean.TRUE.equals(isWeekend)) {
            totalSurcharge = totalSurcharge.add(baseAmount.multiply(WEEKEND_SURCHARGE_RATE));
        }
        if (Boolean.TRUE.equals(isHoliday)) {
            totalSurcharge = totalSurcharge.add(baseAmount.multiply(HOLIDAY_SURCHARGE_RATE));
        }

        return totalSurcharge.setScale(SCALE, RoundingMode.HALF_UP);
    }

    @Override
    public String generateBillingNo() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "BL" + datePart + randomPart;
    }

    private boolean isNightTime(LocalDateTime time) {
        if (time == null) {
            return false;
        }
        LocalTime localTime = time.toLocalTime();
        return !localTime.isBefore(NIGHT_END) && localTime.isAfter(NIGHT_START)
                || localTime.isBefore(NIGHT_END)
                || localTime.equals(NIGHT_START);
    }

    private boolean isWeekend(LocalDateTime time) {
        if (time == null) {
            return false;
        }
        int dayOfWeek = time.get(ChronoField.DAY_OF_WEEK);
        return dayOfWeek == 6 || dayOfWeek == 7;
    }
}
