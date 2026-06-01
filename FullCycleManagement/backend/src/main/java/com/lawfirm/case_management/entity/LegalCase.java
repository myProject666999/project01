package com.lawfirm.case_management.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lawfirm.case_management.enums.CaseStatus;
import lombok.Data;
import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "legal_case")
public class LegalCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_number", length = 50, unique = true)
    private String caseNumber;

    @Column(name = "case_name", nullable = false, length = 200)
    private String caseName;

    @Column(name = "case_type", nullable = false, columnDefinition = "TINYINT")
    private Integer caseType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CaseStatus status = CaseStatus.CONSULTATION;

    @Column(name = "case_description", columnDefinition = "TEXT")
    private String caseDescription;

    @Column(name = "client_id")
    private Long clientId;

    @Column(name = "opposing_party_id")
    private Long opposingPartyId;

    @Column(length = 200)
    private String court;

    @Column(length = 50)
    private String judge;

    @Column(name = "filing_date")
    private LocalDate filingDate;

    @Column(name = "hearing_date")
    private LocalDate hearingDate;

    @Column(name = "judgment_date")
    private LocalDate judgmentDate;

    @Column(name = "close_date")
    private LocalDate closeDate;

    @Column(name = "archive_date")
    private LocalDate archiveDate;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", insertable = false, updatable = false)
    private Client client;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opposing_party_id", insertable = false, updatable = false)
    private Client opposingParty;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
