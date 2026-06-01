package com.borderport.config;

import com.borderport.entity.Lane;
import com.borderport.entity.Quota;
import com.borderport.repository.LaneRepository;
import com.borderport.repository.QuotaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitRunner implements CommandLineRunner {

    private final QuotaRepository quotaRepository;
    private final LaneRepository laneRepository;
    private final StringRedisTemplate redisTemplate;

    @Override
    public void run(String... args) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(7);

        List<Lane> allLanes = laneRepository.findAll();
        String[] timeSlots = {
                "06:00-08:00", "08:00-10:00", "10:00-12:00",
                "12:00-14:00", "14:00-16:00", "16:00-18:00", "18:00-20:00"
        };

        for (LocalDate date = today; date.isBefore(endDate); date = date.plusDays(1)) {
            for (Lane lane : allLanes) {
                for (String timeSlot : timeSlots) {
                    boolean exists = quotaRepository
                            .findByPortIdAndVehicleTypeAndQuotaDateAndTimeSlot(
                                    lane.getPortId(), lane.getLaneType(), date, timeSlot)
                            .isPresent();
                    if (!exists) {
                        int baseQuota = "CARGO".equals(lane.getLaneType()) ? 50 : 30;
                        Quota quota = new Quota();
                        quota.setPortId(lane.getPortId());
                        quota.setLaneId(lane.getId());
                        quota.setVehicleType(lane.getLaneType());
                        quota.setQuotaDate(date);
                        quota.setTimeSlot(timeSlot);
                        quota.setBaseQuota(baseQuota);
                        quota.setAdjustedQuota(baseQuota);
                        quota.setUsedCount(0);
                        quotaRepository.save(quota);

                        String redisKey = "quota:remaining:" + lane.getPortId() + ":"
                                + lane.getLaneType() + ":" + date + ":" + timeSlot;
                        redisTemplate.opsForValue().set(redisKey, String.valueOf(baseQuota));
                    }
                }
            }
        }
    }
}
