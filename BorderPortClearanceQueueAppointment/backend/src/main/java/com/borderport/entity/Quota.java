package com.borderport.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bpc_quota")
public class Quota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "port_id", nullable = false)
    private Long portId;

    @Column(name = "lane_id", nullable = false)
    private Long laneId;

    @Column(name = "vehicle_type", length = 20)
    private String vehicleType;

    @Column(name = "quota_date", nullable = false)
    private LocalDate quotaDate;

    @Column(name = "time_slot", length = 20)
    private String timeSlot;

    @Column(name = "base_quota")
    private Integer baseQuota = 0;

    @Column(name = "adjusted_quota")
    private Integer adjustedQuota = 0;

    @Column(name = "used_count")
    private Integer usedCount = 0;

    @Column(name = "created_at", updatable = false)
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
