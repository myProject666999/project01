package com.gafpr.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "weather_briefing")
public class WeatherBriefing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "flight_plan_id", nullable = false)
    private Long flightPlanId;

    @Column(name = "briefing_time", nullable = false)
    private LocalDateTime briefingTime;

    @Column(name = "valid_from", nullable = false)
    private LocalDateTime validFrom;

    @Column(name = "valid_to", nullable = false)
    private LocalDateTime validTo;

    @Column(name = "departure_weather", columnDefinition = "TEXT")
    private String departureWeather;

    @Column(name = "arrival_weather", columnDefinition = "TEXT")
    private String arrivalWeather;

    @Column(name = "enroute_weather", columnDefinition = "TEXT")
    private String enrouteWeather;

    @Column(name = "wind_speed")
    private Integer windSpeed;

    @Column(name = "wind_direction")
    private Integer windDirection;

    private Integer visibility;

    @Column(name = "cloud_base")
    private Integer cloudBase;

    private Integer temperature;

    @Column(name = "weather_condition", length = 50)
    private String weatherCondition;

    @Column(name = "briefing_content", columnDefinition = "TEXT")
    private String briefingContent;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
