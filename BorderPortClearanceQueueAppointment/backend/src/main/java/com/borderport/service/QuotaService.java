package com.borderport.service;

import com.borderport.dto.QuotaAdjustDTO;
import com.borderport.dto.QuotaDTO;
import com.borderport.entity.Quota;
import com.borderport.repository.QuotaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuotaService {

    private final QuotaRepository quotaRepository;
    private final StringRedisTemplate redisTemplate;

    public List<QuotaDTO> getQuotas(Long portId, String vehicleType, LocalDate date) {
        return quotaRepository.findByPortIdAndVehicleTypeAndQuotaDate(portId, vehicleType, date)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Quota createQuota(Quota quota) {
        Quota saved = quotaRepository.save(quota);
        String redisKey = buildRedisKey(saved.getPortId(), saved.getVehicleType(), saved.getQuotaDate(), saved.getTimeSlot());
        redisTemplate.opsForValue().set(redisKey, String.valueOf(saved.getAdjustedQuota()));
        return saved;
    }

    public Quota updateQuota(Long id, Quota quota) {
        Quota existing = quotaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("配额不存在"));
        existing.setPortId(quota.getPortId());
        existing.setLaneId(quota.getLaneId());
        existing.setVehicleType(quota.getVehicleType());
        existing.setQuotaDate(quota.getQuotaDate());
        existing.setTimeSlot(quota.getTimeSlot());
        existing.setBaseQuota(quota.getBaseQuota());
        existing.setAdjustedQuota(quota.getAdjustedQuota());
        existing.setUsedCount(quota.getUsedCount());
        Quota saved = quotaRepository.save(existing);
        String redisKey = buildRedisKey(saved.getPortId(), saved.getVehicleType(), saved.getQuotaDate(), saved.getTimeSlot());
        redisTemplate.opsForValue().set(redisKey, String.valueOf(saved.getAdjustedQuota() - saved.getUsedCount()));
        return saved;
    }

    public Quota adjustQuota(QuotaAdjustDTO dto) {
        Quota quota = quotaRepository.findByPortIdAndVehicleTypeAndQuotaDateAndTimeSlot(
                dto.getPortId(), dto.getVehicleType(), dto.getDate(), dto.getTimeSlot())
                .orElseThrow(() -> new RuntimeException("配额不存在"));
        int newAdjusted = Math.max(0, quota.getAdjustedQuota() + dto.getDelta());
        quota.setAdjustedQuota(newAdjusted);
        Quota saved = quotaRepository.save(quota);
        String redisKey = buildRedisKey(dto.getPortId(), dto.getVehicleType(), dto.getDate(), dto.getTimeSlot());
        redisTemplate.opsForValue().set(redisKey, String.valueOf(newAdjusted - saved.getUsedCount()));
        return saved;
    }

    public boolean deductQuota(Long portId, String vehicleType, LocalDate date, String timeSlot) {
        String redisKey = buildRedisKey(portId, vehicleType, date, timeSlot);
        Long remaining = redisTemplate.opsForValue().decrement(redisKey);
        if (remaining != null && remaining >= 0) {
            quotaRepository.findByPortIdAndVehicleTypeAndQuotaDateAndTimeSlot(portId, vehicleType, date, timeSlot)
                    .ifPresent(quota -> {
                        quota.setUsedCount(quota.getUsedCount() + 1);
                        quotaRepository.save(quota);
                    });
            return true;
        } else {
            redisTemplate.opsForValue().increment(redisKey);
            return false;
        }
    }

    public void releaseQuota(Long portId, String vehicleType, LocalDate date, String timeSlot) {
        String redisKey = buildRedisKey(portId, vehicleType, date, timeSlot);
        redisTemplate.opsForValue().increment(redisKey);
        quotaRepository.findByPortIdAndVehicleTypeAndQuotaDateAndTimeSlot(portId, vehicleType, date, timeSlot)
                .ifPresent(quota -> {
                    quota.setUsedCount(Math.max(0, quota.getUsedCount() - 1));
                    quotaRepository.save(quota);
                });
    }

    private String buildRedisKey(Long portId, String vehicleType, LocalDate date, String timeSlot) {
        return "quota:remaining:" + portId + ":" + vehicleType + ":" + date + ":" + timeSlot;
    }

    private QuotaDTO convertToDTO(Quota quota) {
        QuotaDTO dto = new QuotaDTO();
        dto.setId(quota.getId());
        dto.setPortId(quota.getPortId());
        dto.setLaneId(quota.getLaneId());
        dto.setVehicleType(quota.getVehicleType());
        dto.setQuotaDate(quota.getQuotaDate());
        dto.setTimeSlot(quota.getTimeSlot());
        dto.setBaseQuota(quota.getBaseQuota());
        dto.setAdjustedQuota(quota.getAdjustedQuota());
        dto.setUsedCount(quota.getUsedCount());

        int dbRemaining = quota.getAdjustedQuota() - quota.getUsedCount();
        String redisKey = buildRedisKey(quota.getPortId(), quota.getVehicleType(), quota.getQuotaDate(), quota.getTimeSlot());
        String cached = redisTemplate.opsForValue().get(redisKey);
        if (cached != null) {
            dto.setRemaining(Integer.parseInt(cached));
        } else {
            dto.setRemaining(dbRemaining);
        }
        return dto;
    }
}
