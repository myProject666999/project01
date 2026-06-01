package com.ptod.dto;

import com.ptod.entity.Appointment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {

    private Long id;
    private Long teacherId;
    private String teacherName;
    private Long parentId;
    private String parentName;
    private Long timeSlotId;
    private Appointment.AppointmentStatus status;
    private LocalDateTime appointmentTime;
    private Integer duration;
    private LocalDateTime createdAt;
}
