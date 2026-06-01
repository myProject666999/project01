package com.lawfirm.case_management.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "case_lawyer", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"case_id", "lawyer_id"})
})
public class CaseLawyer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_id", nullable = false)
    private Long caseId;

    @Column(name = "lawyer_id", nullable = false)
    private Long lawyerId;

    @Column(name = "role", columnDefinition = "TINYINT DEFAULT 1")
    private Integer role = 1;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", insertable = false, updatable = false)
    private LegalCase legalCase;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_id", insertable = false, updatable = false)
    private Lawyer lawyer;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
