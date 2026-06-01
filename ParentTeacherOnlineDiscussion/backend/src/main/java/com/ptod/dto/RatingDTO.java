package com.ptod.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RatingDTO {

    private Long id;
    private Long appointmentId;
    private Long parentId;
    private String parentName;
    private Long teacherId;
    private Integer score;
    private String comment;
    private LocalDateTime createdAt;
}
