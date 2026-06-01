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
@Table(name = "pilotage_assignment", indexes = {
        @Index(name = "idx_assignment_no", columnList = "assignmentNo"),
        @Index(name = "idx_order_id", columnList = "orderId"),
        @Index(name = "idx_pilot_id", columnList = "pilotId"),
        @Index(name = "idx_planned_time", columnList = "plannedPilotageTime"),
        @Index(name = "idx_status", columnList = "status")
})
public class PilotageAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 30)
    private String assignmentNo;

    @Column(nullable = false)
    private Long orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orderId", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "fk_pilotage_assignment_order"))
    private PilotageOrder order;

    @Column(nullable = false)
    private Long pilotId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pilotId", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "fk_pilotage_assignment_pilot"))
    private Pilot pilot;

    @Column(nullable = false)
    private LocalDateTime tideWindowStart;

    @Column(nullable = false)
    private LocalDateTime tideWindowEnd;

    @Column(nullable = false)
    private LocalDateTime plannedPilotageTime;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal pilotageDistance;

    @Builder.Default
    private Integer tugCount = 1;

    @Builder.Default
    private Integer status = 1;

    @Builder.Default
    private Boolean isExtended = false;

    private Long originalAssignmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "originalAssignmentId", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "fk_pilotage_assignment_original"))
    private PilotageAssignment originalAssignment;

    @Column(columnDefinition = "TEXT")
    private String remark;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
