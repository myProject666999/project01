package com.maritime.pilotage.entity;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pilotage_order", indexes = {
        @Index(name = "idx_order_no", columnList = "orderNo"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_eta", columnList = "eta")
})
public class PilotageOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 30)
    private String orderNo;

    @Column(nullable = false)
    private Long vesselId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vesselId", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "fk_pilotage_order_vessel"))
    private Vessel vessel;

    @Column(nullable = false, length = 100)
    private String companyName;

    @Column(length = 50)
    private String contactPerson;

    @Column(length = 20)
    private String contactPhone;

    @Column(nullable = false)
    private LocalDateTime eta;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal etaDraft;

    @Column(length = 100)
    private String departurePort;

    @Column(length = 100)
    private String destinationPort;

    @Column(nullable = false)
    private Integer pilotageType;

    @Column(length = 50)
    private String berthFrom;

    @Column(length = 50)
    private String berthTo;

    @Column(columnDefinition = "TEXT")
    private String specialRequirements;

    @Column(nullable = false)
    private LocalDateTime submitTime;

    @Builder.Default
    private Integer status = 1;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
