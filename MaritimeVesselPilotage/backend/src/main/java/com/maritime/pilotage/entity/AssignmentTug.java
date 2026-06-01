package com.maritime.pilotage.entity;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "assignment_tug", uniqueConstraints = {
        @UniqueConstraint(name = "uk_assignment_tug", columnNames = {"assignmentId", "tugId"})
})
public class AssignmentTug {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long assignmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignmentId", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "fk_assignment_tug_assignment"))
    private PilotageAssignment assignment;

    @Column(nullable = false)
    private Long tugId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tugId", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "fk_assignment_tug_tug"))
    private Tug tug;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime assignedAt;
}
