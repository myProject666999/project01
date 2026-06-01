package com.borderport.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentCreateDTO {
    private Long portId;
    private String vehicleType;
    private String plateNumber;
    private String driverName;
    private String driverPhone;
    private LocalDate appointmentDate;
    private String timeSlot;
}
