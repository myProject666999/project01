package com.maritime.pilotage.dto;

import javax.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingCalculationRequestDTO {

    @NotNull(message = "订单ID不能为空")
    private Long orderId;

    @NotNull(message = "船舶ID不能为空")
    private Long vesselId;

    @NotNull(message = "引航完成ID不能为空")
    private Long completionId;

    @NotNull(message = "净吨位不能为空")
    private BigDecimal netTonnage;

    @NotNull(message = "引航距离不能为空")
    private BigDecimal pilotageDistance;

    private LocalDateTime pilotageStartTime;

    private LocalDateTime pilotageEndTime;

    private Boolean isNightSurcharge;

    private Boolean isWeekendSurcharge;

    private Boolean isHolidaySurcharge;

    private BigDecimal tugFee;

    private BigDecimal otherFee;

    private BigDecimal discount;
}
