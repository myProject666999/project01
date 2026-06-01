package com.judicial.appraisal.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "appraisal_task")
@EntityListeners(AuditingEntityListener.class)
public class AppraisalTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_no", nullable = false, unique = true, length = 50)
    private String taskNo;

    @Column(name = "entrustment_id", nullable = false)
    private Long entrustmentId;

    @Column(name = "evidence_id", nullable = false)
    private Long evidenceId;

    @Column(name = "appraiser_id", nullable = false)
    private Long appraiserId;

    @Column(name = "assistant_id")
    private Long assistantId;

    @Column(name = "task_description", columnDefinition = "TEXT")
    private String taskDescription;

    @Column(length = 20)
    private String status;

    @Column(name = "assign_time")
    private LocalDateTime assignTime;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "complete_time")
    private LocalDateTime completeTime;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
