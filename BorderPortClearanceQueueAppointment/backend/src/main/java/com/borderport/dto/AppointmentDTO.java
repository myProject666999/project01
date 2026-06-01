package com.borderport.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {
    private Long id;
    private String appointmentNo;
    private Long portId;
    private String portName;
    private Long quotaId;
    private String vehicleType;
    private String plateNumber;
    private String driverName;
    private String driverPhone;
    private LocalDate appointmentDate;
    private String timeSlot;
    private String qrCode;
    private String status;
    private BigDecimal checkinLatitude;
    private BigDecimal checkinLongitude;
    private LocalDateTime checkinTime;
}
