package com.judicial.appraisal.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "evidence")
public class Evidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "evidence_no", nullable = false, unique = true, length = 64)
    private String evidenceNo;

    @Column(name = "entrustment_id", nullable = false)
    private Long entrustmentId;

    @Column(name = "evidence_name", nullable = false, length = 255)
    private String evidenceName;

    @Column(name = "evidence_type", length = 64)
    private String evidenceType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "weight", precision = 10, scale = 2)
    private BigDecimal weight;

    @Column(name = "seal_status", length = 32)
    private String sealStatus;

    @Column(name = "storage_location", length = 255)
    private String storageLocation;

    @Column(name = "receive_time")
    private LocalDateTime receiveTime;

    @Column(name = "received_by")
    private Long receivedBy;

    @Column(name = "delivered_by", length = 64)
    private String deliveredBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
