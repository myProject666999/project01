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
@Table(name = "pilotage_completion", indexes = {
        @Index(name = "idx_completion_no", columnList = "completionNo"),
        @Index(name = "idx_assignment_id", columnList = "assignmentId")
})
public class PilotageCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 30)
    private String completionNo;

    @Column(nullable = false)
    private Long assignmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignmentId", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "fk_pilotage_completion_assignment"))
    private PilotageAssignment assignment;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    @Column(precision = 8, scale = 2)
    private BigDecimal actualDistance;

    private Integer pilotageQuality;

    @Column(columnDefinition = "TEXT")
    private String delayReason;

    @Column(length = 100)
    private String weatherCondition;

    @Column(precision = 6, scale = 2)
    private BigDecimal visibility;

    @Column(precision = 6, scale = 2)
    private BigDecimal windSpeed;

    @Column(precision = 5, scale = 2)
    private BigDecimal waveHeight;

    @Builder.Default
    private Integer completionStatus = 1;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
