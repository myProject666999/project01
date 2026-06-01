package com.gafpr.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "approval_process")
public class ApprovalProcess {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "flight_plan_id", nullable = false)
    private Long flightPlanId;

    @Column(name = "node_config_id", nullable = false)
    private Long nodeConfigId;

    @Column(nullable = false)
    private Integer level;

    @Column(nullable = false)
    private Integer sequence;

    @Column(name = "node_name", nullable = false, length = 50)
    private String nodeName;

    @Column(name = "approver_user_id")
    private Long approverUserId;

    @Column(name = "approver_name", length = 50)
    private String approverName;

    @Column(length = 20)
    private String status = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "process_time")
    private LocalDateTime processTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
