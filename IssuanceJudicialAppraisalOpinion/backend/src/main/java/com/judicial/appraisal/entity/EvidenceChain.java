package com.judicial.appraisal.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "evidence_chain")
public class EvidenceChain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "evidence_id", nullable = false)
    private Long evidenceId;

    @Column(name = "chain_no", nullable = false, unique = true, length = 64)
    private String chainNo;

    @Column(name = "operation_type", nullable = false, length = 32)
    private String operationType;

    @Column(name = "operation_time", nullable = false)
    private LocalDateTime operationTime;

    @Column(name = "operator_id", nullable = false)
    private Long operatorId;

    @Column(name = "operator_signature", nullable = false, length = 255)
    private String operatorSignature;

    @Column(name = "counterpart_id")
    private Long counterpartId;

    @Column(name = "counterpart_signature", length = 255)
    private String counterpartSignature;

    @Column(name = "previous_seal_status", length = 32)
    private String previousSealStatus;

    @Column(name = "new_seal_status", length = 32)
    private String newSealStatus;

    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
