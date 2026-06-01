package com.gafpr.entity;

import lombok.Data;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "airspace")
public class Airspace {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(name = "lower_limit")
    private Integer lowerLimit;

    @Column(name = "upper_limit")
    private Integer upperLimit;

    @Column(name = "center_lat", precision = 10, scale = 6)
    private BigDecimal centerLat;

    @Column(name = "center_lng", precision = 10, scale = 6)
    private BigDecimal centerLng;

    private Integer radius;

    @Column(columnDefinition = "TEXT")
    private String polygon;

    @Column(name = "approval_level")
    private Integer approvalLevel = 1;

    private Integer status = 1;

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
