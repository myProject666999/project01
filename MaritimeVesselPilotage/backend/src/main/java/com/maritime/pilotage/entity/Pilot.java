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
@Table(name = "pilot", indexes = {
        @Index(name = "idx_pilot_level", columnList = "pilotLevel"),
        @Index(name = "idx_status", columnList = "status")
})
public class Pilot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String employeeNo;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 10)
    private String gender;

    @Column(length = 20)
    private String phone;

    @Column(length = 18)
    private String idCard;

    @Column(nullable = false)
    @Builder.Default
    private Integer pilotLevel = 1;

    @Column(length = 50)
    private String qualificationCert;

    private LocalDate issueDate;

    private LocalDate expiryDate;

    @Column(nullable = false)
    @Builder.Default
    private Integer status = 1;

    @Builder.Default
    private Integer totalPilotageCount = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
