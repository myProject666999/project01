package com.gafpr.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "approval_node_config")
public class ApprovalNodeConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "airspace_type", nullable = false, length = 20)
    private String airspaceType;

    @Column(nullable = false)
    private Integer level;

    @Column(name = "node_name", nullable = false, length = 50)
    private String nodeName;

    @Column(name = "approver_role", nullable = false, length = 50)
    private String approverRole;

    @Column(name = "approver_user_id")
    private Long approverUserId;

    @Column(nullable = false)
    private Integer sequence;

    @Column(name = "is_required")
    private Integer isRequired = 1;

    @Column(length = 200)
    private String description;

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
