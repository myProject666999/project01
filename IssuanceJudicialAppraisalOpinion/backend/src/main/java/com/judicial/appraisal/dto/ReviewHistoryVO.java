package com.judicial.appraisal.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewHistoryVO {

    private Long id;

    private Long opinionId;

    private Integer reviewLevel;

    private Long reviewerId;

    private String reviewerName;

    private String reviewerSignature;

    private String result;

    private Integer rejectTargetLevel;

    private String opinion;

    private LocalDateTime reviewTime;

    private LocalDateTime createdAt;
}
