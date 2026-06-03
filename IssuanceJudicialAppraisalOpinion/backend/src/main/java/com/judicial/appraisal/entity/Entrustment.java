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
@Table(name = "entrustment")
@EntityListeners(AuditingEntityListener.class)
public class Entrustment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entrustment_no", nullable = false, unique = true, length = 50)
    private String entrustmentNo;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "case_name", nullable = false, length = 200)
    private String caseName;

    @Column(name = "case_description", columnDefinition = "TEXT")
    private String caseDescription;

    @Column(name = "appraisal_type", nullable = false, length = 50)
    private String appraisalType;

    @Column(name = "appraisal_matter", nullable = false, length = 200)
    private String appraisalMatter;

    @Column(name = "entrust_date", nullable = false)
    private LocalDate entrustDate;

    private LocalDate deadline;

    @Column(length = 20)
    private String status;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Transient
    private String clientName;
}
