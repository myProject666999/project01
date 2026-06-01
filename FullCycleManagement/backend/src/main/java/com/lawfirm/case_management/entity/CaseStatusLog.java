package com.lawfirm.case_management.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lawfirm.case_management.enums.CaseStatus;
import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "case_status_log")
public class CaseStatusLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_id", nullable = false)
    private Long caseId;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 30)
    private CaseStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 30)
    private CaseStatus newStatus;

    @Column(name = "changed_by")
    private Long changedBy;

    @Column(name = "change_reason", length = 500)
    private String changeReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", insertable = false, updatable = false)
    private LegalCase legalCase;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
