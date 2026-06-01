package com.borderport.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bpc_appointment")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_no", unique = true, nullable = false)
    private String appointmentNo;

    @Column(name = "port_id", nullable = false)
    private Long portId;

    @Column(name = "quota_id", nullable = false)
    private Long quotaId;

    @Column(name = "vehicle_type", length = 20)
    private String vehicleType;

    @Column(name = "plate_number", nullable = false)
    private String plateNumber;

    @Column(name = "driver_name", nullable = false)
    private String driverName;

    @Column(name = "driver_phone", nullable = false)
    private String driverPhone;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "time_slot", length = 20)
    private String timeSlot;

    @Column(name = "qr_code", columnDefinition = "TEXT")
    private String qrCode;

    @Column(length = 20)
    private String status = "BOOKED";

    @Column(name = "checkin_latitude", precision = 10, scale = 7)
    private BigDecimal checkinLatitude;

    @Column(name = "checkin_longitude", precision = 10, scale = 7)
    private BigDecimal checkinLongitude;

    @Column(name = "checkin_time")
    private LocalDateTime checkinTime;

    @Column(name = "created_at", updatable = false)
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
