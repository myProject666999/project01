package com.ptod.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeetingSummaryDTO {

    private Long id;
    private Long appointmentId;
    private String teacherNotes;
    private String parentNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
