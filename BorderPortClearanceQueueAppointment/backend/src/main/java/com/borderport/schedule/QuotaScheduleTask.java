package com.borderport.schedule;

import com.borderport.entity.Port;
import com.borderport.entity.Quota;
import com.borderport.repository.PortRepository;
import com.borderport.repository.QueueRecordRepository;
import com.borderport.repository.QuotaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@EnableScheduling
@RequiredArgsConstructor
public class QuotaScheduleTask {

    private final QuotaRepository quotaRepository;
    private final StringRedisTemplate redisTemplate;
    private final QueueRecordRepository queueRecordRepository;
    private final PortRepository portRepository;

    @Scheduled(fixedRate = 300000)
    public void adjustQuotasDynamically() {
        List<Port> openPorts = portRepository.findByStatus("OPEN");

        for (Port port : openPorts) {
            int waitingCount = queueRecordRepository.countByPortIdAndStatus(port.getId(), "WAITING");

            String congestionLevel;
            if (waitingCount > 20) {
                congestionLevel = "SEVERE";
            } else if (waitingCount >= 5) {
                congestionLevel = "MODERATE";
            } else {
                congestionLevel = "SMOOTH";
            }

            redisTemplate.opsForValue().set("port:congestion:" + port.getId(), congestionLevel);

            List<Quota> quotas = quotaRepository.findByPortIdAndVehicleTypeAndQuotaDate(
                    port.getId(), "CARGO", LocalDate.now());

            for (Quota quota : quotas) {
                int newAdjusted;

                if (waitingCount > 20) {
                    newAdjusted = Math.max(0, (int) Math.floor(quota.getAdjustedQuota() * 0.9));
                } else if (waitingCount < 5) {
                    int cap = (int) Math.floor(quota.getBaseQuota() * 1.5);
                    newAdjusted = Math.min(cap, (int) Math.ceil(quota.getAdjustedQuota() * 1.1));
                } else {
                    continue;
                }

                quota.setAdjustedQuota(newAdjusted);
                quotaRepository.save(quota);

                String redisKey = "quota:remaining:" + port.getId() + ":" + quota.getVehicleType()
                        + ":" + quota.getQuotaDate() + ":" + quota.getTimeSlot();
                redisTemplate.opsForValue().set(redisKey, String.valueOf(newAdjusted - quota.getUsedCount()));
            }

            quotas = quotaRepository.findByPortIdAndVehicleTypeAndQuotaDate(
                    port.getId(), "PASSENGER", LocalDate.now());

            for (Quota quota : quotas) {
                int newAdjusted;

                if (waitingCount > 20) {
                    newAdjusted = Math.max(0, (int) Math.floor(quota.getAdjustedQuota() * 0.9));
                } else if (waitingCount < 5) {
                    int cap = (int) Math.floor(quota.getBaseQuota() * 1.5);
                    newAdjusted = Math.min(cap, (int) Math.ceil(quota.getAdjustedQuota() * 1.1));
                } else {
                    continue;
                }

                quota.setAdjustedQuota(newAdjusted);
                quotaRepository.save(quota);

                String redisKey = "quota:remaining:" + port.getId() + ":" + quota.getVehicleType()
                        + ":" + quota.getQuotaDate() + ":" + quota.getTimeSlot();
                redisTemplate.opsForValue().set(redisKey, String.valueOf(newAdjusted - quota.getUsedCount()));
            }
        }
    }
}
