package com.lawfirm.case_management.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "court_session")
public class CourtSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_id", nullable = false)
    private Long caseId;

    @Column(name = "session_time", nullable = false)
    private LocalDateTime sessionTime;

    @Column(name = "court_room", length = 100)
    private String courtRoom;

    @Column(length = 50)
    private String judge;

    @Column(length = 50)
    private String clerk;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "status", columnDefinition = "TINYINT")
    private Integer status = 1;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", insertable = false, updatable = false)
    private LegalCase legalCase;

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
