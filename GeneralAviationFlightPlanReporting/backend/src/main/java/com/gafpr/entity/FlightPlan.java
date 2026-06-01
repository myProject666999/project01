package com.gafpr.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "flight_plan")
public class FlightPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "plan_number", unique = true, length = 50)
    private String planNumber;

    @Column(name = "pilot_id", nullable = false)
    private Long pilotId;

    @Column(name = "aircraft_id", nullable = false)
    private Long aircraftId;

    @Column(name = "flight_type", nullable = false, length = 30)
    private String flightType;

    @Column(name = "departure_airport", nullable = false, length = 50)
    private String departureAirport;

    @Column(name = "arrival_airport", nullable = false, length = 50)
    private String arrivalAirport;

    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "arrival_time", nullable = false)
    private LocalDateTime arrivalTime;

    @Column(name = "actual_departure_time")
    private LocalDateTime actualDepartureTime;

    @Column(name = "actual_arrival_time")
    private LocalDateTime actualArrivalTime;

    @Column(columnDefinition = "TEXT")
    private String route;

    @Column(columnDefinition = "TEXT")
    private String waypoints;

    @Column(name = "airspace_ids", length = 200)
    private String airspaceIds;

    private Integer altitude;

    private Integer speed;

    @Column(columnDefinition = "TEXT")
    private String purpose;

    private Integer passengers = 0;

    @Column(name = "emergency_contact", length = 100)
    private String emergencyContact;

    @Column(name = "emergency_phone", length = 20)
    private String emergencyPhone;

    @Column(length = 20)
    private String status = "DRAFT";

    @Column(name = "submit_time")
    private LocalDateTime submitTime;

    @Column(name = "approve_time")
    private LocalDateTime approveTime;

    @Column(name = "cancel_time")
    private LocalDateTime cancelTime;

    @Column(name = "close_time")
    private LocalDateTime closeTime;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
