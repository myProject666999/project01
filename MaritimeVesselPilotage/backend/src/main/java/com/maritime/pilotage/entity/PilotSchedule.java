package com.maritime.pilotage.entity;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pilot_schedule", uniqueConstraints = {
        @UniqueConstraint(name = "uk_pilot_shift", columnNames = {"pilotId", "scheduleDate", "shiftType"})
}, indexes = {
        @Index(name = "idx_schedule_date", columnList = "scheduleDate"),
        @Index(name = "idx_pilot_date", columnList = "pilotId, scheduleDate")
})
public class PilotSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long pilotId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pilotId", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "fk_pilot_schedule_pilot", value = ConstraintMode.CONSTRAINT))
    private Pilot pilot;

    @Column(nullable = false)
    private LocalDate scheduleDate;

    @Column(nullable = false)
    private Integer shiftType;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Builder.Default
    private Boolean isOnCall = false;

    @Builder.Default
    private Integer status = 1;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
