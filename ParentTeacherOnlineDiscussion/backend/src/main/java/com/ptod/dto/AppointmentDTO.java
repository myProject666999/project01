package com.ptod.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
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
    private Long parentId;
    private Long timeSlotId;

    @JsonIgnore
    private Appointment.AppointmentStatus statusEnum;

    private LocalDateTime appointmentTime;
    private Integer duration;
    private String subject;
    private String description;
    private String roomId;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    private UserDTO teacher;
    private UserDTO parent;
    private TimeSlotDTO timeSlot;

    public String getStatus() {
        return statusEnum != null ? statusEnum.name().toLowerCase() : null;
    }
}
