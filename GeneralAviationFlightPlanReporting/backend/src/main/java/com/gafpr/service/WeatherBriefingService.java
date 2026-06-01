package com.gafpr.service;

import com.gafpr.entity.FlightPlan;
import com.gafpr.entity.WeatherBriefing;
import com.gafpr.repository.FlightPlanRepository;
import com.gafpr.repository.WeatherBriefingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class WeatherBriefingService {

    @Autowired
    private WeatherBriefingRepository weatherBriefingRepository;

    @Autowired
    private FlightPlanRepository flightPlanRepository;

    public List<WeatherBriefing> getBriefingsByFlightPlan(Long flightPlanId) {
        return weatherBriefingRepository.findByFlightPlanIdOrderByBriefingTimeDesc(flightPlanId);
    }

    public WeatherBriefing getLatestValidBriefing(Long flightPlanId) {
        return weatherBriefingRepository.findLatestValidBriefing(flightPlanId, LocalDateTime.now()).orElse(null);
    }

    @Transactional
    public WeatherBriefing generateBriefing(Long flightPlanId) {
        FlightPlan flightPlan = flightPlanRepository.findById(flightPlanId).orElse(null);
        if (flightPlan == null) {
            return null;
        }

        LocalDateTime briefingTime = LocalDateTime.now();
        LocalDateTime validFrom = briefingTime;
        LocalDateTime validTo = briefingTime.plusHours(6);

        WeatherBriefing briefing = new WeatherBriefing();
        briefing.setFlightPlanId(flightPlanId);
        briefing.setBriefingTime(briefingTime);
        briefing.setValidFrom(validFrom);
        briefing.setValidTo(validTo);

        Random random = new Random();
        briefing.setWindSpeed(random.nextInt(30));
        briefing.setWindDirection(random.nextInt(360));
        briefing.setVisibility(5000 + random.nextInt(10000));
        briefing.setCloudBase(300 + random.nextInt(2000));
        briefing.setTemperature(15 + random.nextInt(15));

        String[] conditions = {"晴朗", "多云", "阴天", "轻雾"};
        briefing.setWeatherCondition(conditions[random.nextInt(conditions.length)]);

        String content = String.format(
            "【气象简报】\n起飞机场：%s\n降落机场：%s\n" +
            "天气状况：%s\n能见度：%d米\n风速：%dkm/h\n风向：%d°\n" +
            "云底高度：%d米\n温度：%d℃\n" +
            "有效时间：%s 至 %s",
            flightPlan.getDepartureAirport(),
            flightPlan.getArrivalAirport(),
            briefing.getWeatherCondition(),
            briefing.getVisibility(),
            briefing.getWindSpeed(),
            briefing.getWindDirection(),
            briefing.getCloudBase(),
            briefing.getTemperature(),
            validFrom.toString(),
            validTo.toString()
        );
        briefing.setBriefingContent(content);
        briefing.setDepartureWeather(briefing.getWeatherCondition());
        briefing.setArrivalWeather(briefing.getWeatherCondition());
        briefing.setEnrouteWeather(briefing.getWeatherCondition());

        return weatherBriefingRepository.save(briefing);
    }
}
