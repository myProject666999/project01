package com.judicial.appraisal.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "review_record")
@EntityListeners(AuditingEntityListener.class)
public class ReviewRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "opinion_id", nullable = false)
    private Long opinionId;

    @Column(name = "review_level", nullable = false)
    private Integer reviewLevel;

    @Column(name = "reviewer_id", nullable = false)
    private Long reviewerId;

    @Column(name = "reviewer_signature", length = 255)
    private String reviewerSignature;

    @Column(nullable = false, length = 32)
    private String result;

    @Column(name = "reject_target_level")
    private Integer rejectTargetLevel;

    @Column(columnDefinition = "TEXT")
    private String opinion;

    @Column(name = "review_time")
    private LocalDateTime reviewTime;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
