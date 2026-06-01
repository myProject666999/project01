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
@Table(name = "opinion")
@EntityListeners(AuditingEntityListener.class)
public class Opinion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "opinion_no", nullable = false, unique = true, length = 50)
    private String opinionNo;

    @Column(name = "entrustment_id", nullable = false)
    private Long entrustmentId;

    @Column(nullable = false)
    private Integer version;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "basic_info", columnDefinition = "TEXT")
    private String basicInfo;

    @Column(name = "inspection_info", columnDefinition = "TEXT")
    private String inspectionInfo;

    @Column(name = "analysis_description", columnDefinition = "TEXT")
    private String analysisDescription;

    @Column(columnDefinition = "TEXT")
    private String conclusion;

    @Column(name = "appraiser1_id")
    private Long appraiser1Id;

    @Column(name = "appraiser1_signature", length = 255)
    private String appraiser1Signature;

    @Column(name = "appraiser2_id")
    private Long appraiser2Id;

    @Column(name = "appraiser2_signature", length = 255)
    private String appraiser2Signature;

    @Column(name = "reviewer1_id")
    private Long reviewer1Id;

    @Column(name = "reviewer1_signature", length = 255)
    private String reviewer1Signature;

    @Column(name = "reviewer2_id")
    private Long reviewer2Id;

    @Column(name = "reviewer2_signature", length = 255)
    private String reviewer2Signature;

    @Column(name = "reviewer3_id")
    private Long reviewer3Id;

    @Column(name = "reviewer3_signature", length = 255)
    private String reviewer3Signature;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "verify_code", length = 64)
    private String verifyCode;

    @Column(name = "qr_code_path", length = 255)
    private String qrCodePath;

    @Column(length = 32)
    private String status;

    @Column(name = "current_review_level")
    private Integer currentReviewLevel;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
