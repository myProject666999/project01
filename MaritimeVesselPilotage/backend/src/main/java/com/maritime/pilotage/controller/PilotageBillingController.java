package com.maritime.pilotage.controller;

import com.maritime.pilotage.common.Result;
import com.maritime.pilotage.dto.BillingCalculationRequestDTO;
import com.maritime.pilotage.dto.BillingCalculationResultDTO;
import com.maritime.pilotage.entity.PilotageBilling;
import com.maritime.pilotage.repository.PilotageBillingRepository;
import com.maritime.pilotage.service.BillingCalculationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pilotage-billings")
public class PilotageBillingController {

    @Autowired
    private PilotageBillingRepository pilotageBillingRepository;

    @Autowired
    private BillingCalculationService billingCalculationService;

    @GetMapping
    public Result<List<PilotageBilling>> list() {
        List<PilotageBilling> list = pilotageBillingRepository.findAll();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<PilotageBilling> getById(@PathVariable Long id) {
        Optional<PilotageBilling> billing = pilotageBillingRepository.findById(id);
        return billing.map(Result::success).orElseGet(() -> Result.error("计费单不存在"));
    }

    @PostMapping
    public Result<PilotageBilling> create(@RequestBody PilotageBilling billing) {
        PilotageBilling saved = pilotageBillingRepository.save(billing);
        return Result.success("创建成功", saved);
    }

    @PutMapping("/{id}")
    public Result<PilotageBilling> update(@PathVariable Long id, @RequestBody PilotageBilling billing) {
        if (!pilotageBillingRepository.existsById(id)) {
            return Result.error("计费单不存在");
        }
        billing.setId(id);
        PilotageBilling updated = pilotageBillingRepository.save(billing);
        return Result.success("更新成功", updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (!pilotageBillingRepository.existsById(id)) {
            return Result.error("计费单不存在");
        }
        pilotageBillingRepository.deleteById(id);
        return Result.success("删除成功", null);
    }

    @GetMapping("/search")
    public Result<List<PilotageBilling>> search(@RequestParam(required = false) String billingNo,
                                                 @RequestParam(required = false) Long orderId,
                                                 @RequestParam(required = false) Long vesselId,
                                                 @RequestParam(required = false) Integer billingStatus) {
        List<PilotageBilling> list = pilotageBillingRepository.findAll();
        if (billingNo != null) {
            list = list.stream().filter(b -> billingNo.equals(b.getBillingNo())).collect(Collectors.toList());
        }
        if (orderId != null) {
            list = list.stream().filter(b -> orderId.equals(b.getOrderId())).collect(Collectors.toList());
        }
        if (vesselId != null) {
            list = list.stream().filter(b -> vesselId.equals(b.getVesselId())).collect(Collectors.toList());
        }
        if (billingStatus != null) {
            list = list.stream().filter(b -> billingStatus.equals(b.getBillingStatus())).collect(Collectors.toList());
        }
        return Result.success(list);
    }

    @GetMapping("/order/{orderId}")
    public Result<List<PilotageBilling>> getByOrderId(@PathVariable Long orderId) {
        List<PilotageBilling> list = pilotageBillingRepository.findAll().stream()
                .filter(b -> orderId.equals(b.getOrderId()))
                .collect(Collectors.toList());
        return Result.success(list);
    }

    @GetMapping("/vessel/{vesselId}")
    public Result<List<PilotageBilling>> getByVesselId(@PathVariable Long vesselId) {
        List<PilotageBilling> list = pilotageBillingRepository.findAll().stream()
                .filter(b -> vesselId.equals(b.getVesselId()))
                .collect(Collectors.toList());
        return Result.success(list);
    }

    @GetMapping("/status/{status}")
    public Result<List<PilotageBilling>> getByStatus(@PathVariable Integer status) {
        List<PilotageBilling> list = pilotageBillingRepository.findAll().stream()
                .filter(b -> status.equals(b.getBillingStatus()))
                .collect(Collectors.toList());
        return Result.success(list);
    }

    @PostMapping("/calculate")
    public Result<BillingCalculationResultDTO> calculateBilling(@RequestBody BillingCalculationRequestDTO request) {
        BillingCalculationResultDTO result = billingCalculationService.calculateBilling(request);
        return Result.success("计算成功", result);
    }

    @PostMapping("/generate")
    public Result<PilotageBilling> generateBilling(@RequestBody BillingCalculationRequestDTO request) {
        PilotageBilling billing = billingCalculationService.generateBilling(request);
        return Result.success("生成成功", billing);
    }

    @GetMapping("/calculate-base-fee")
    public Result<BigDecimal> calculateBaseFee(@RequestParam BigDecimal netTonnage) {
        BigDecimal result = billingCalculationService.calculateBaseFee(netTonnage);
        return Result.success(result);
    }

    @GetMapping("/calculate-tonnage-fee")
    public Result<BigDecimal> calculateTonnageFee(@RequestParam BigDecimal netTonnage) {
        BigDecimal result = billingCalculationService.calculateTonnageFee(netTonnage);
        return Result.success(result);
    }

    @GetMapping("/calculate-distance-fee")
    public Result<BigDecimal> calculateDistanceFee(@RequestParam BigDecimal pilotageDistance) {
        BigDecimal result = billingCalculationService.calculateDistanceFee(pilotageDistance);
        return Result.success(result);
    }

    @GetMapping("/calculate-surcharges")
    public Result<BigDecimal> calculateSurcharges(
            @RequestParam BigDecimal baseAmount,
            @RequestParam Boolean isNight,
            @RequestParam Boolean isWeekend,
            @RequestParam Boolean isHoliday) {
        BigDecimal result = billingCalculationService.calculateSurcharges(baseAmount, isNight, isWeekend, isHoliday);
        return Result.success(result);
    }

    @PostMapping("/{id}/mark-paid")
    public Result<PilotageBilling> markPaid(@PathVariable Long id) {
        Optional<PilotageBilling> optionalBilling = pilotageBillingRepository.findById(id);
        if (!optionalBilling.isPresent()) {
            return Result.error("计费单不存在");
        }
        PilotageBilling billing = optionalBilling.get();
        billing.setBillingStatus(2);
        billing.setPaidDate(LocalDate.now());
        PilotageBilling updated = pilotageBillingRepository.save(billing);
        return Result.success("标记支付成功", updated);
    }
}
