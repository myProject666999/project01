package com.ptod.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlotDTO {

    private Long id;
    private Long teacherId;
    private String teacherName;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer duration;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
}
