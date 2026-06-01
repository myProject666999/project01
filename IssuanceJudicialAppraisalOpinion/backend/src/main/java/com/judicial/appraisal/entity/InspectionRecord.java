package com.judicial.appraisal.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "inspection_record")
@EntityListeners(AuditingEntityListener.class)
public class InspectionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "record_no", nullable = false, unique = true, length = 50)
    private String recordNo;

    @Column(name = "task_id", nullable = false)
    private Long taskId;

    @Column(name = "evidence_id", nullable = false)
    private Long evidenceId;

    @Column(name = "inspection_date", nullable = false)
    private LocalDate inspectionDate;

    @Column(name = "inspection_location", length = 200)
    private String inspectionLocation;

    @Column(name = "environment_desc", columnDefinition = "TEXT")
    private String environmentDesc;

    @Column(columnDefinition = "TEXT")
    private String method;

    @Column(columnDefinition = "TEXT")
    private String process;

    @Column(columnDefinition = "TEXT")
    private String result;

    @Column(length = 200)
    private String instrument;

    @Column(name = "appraiser_id", nullable = false)
    private Long appraiserId;

    @Column(name = "appraiser_signature", length = 100)
    private String appraiserSignature;

    @Column(name = "assistant_id")
    private Long assistantId;

    @Column(name = "assistant_signature", length = 100)
    private String assistantSignature;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
