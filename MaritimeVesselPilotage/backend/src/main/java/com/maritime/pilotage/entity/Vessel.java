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
@Table(name = "vessel", indexes = {
        @Index(name = "idx_vessel_name", columnList = "vesselName"),
        @Index(name = "idx_vessel_level", columnList = "vesselLevel")
})
public class Vessel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String vesselName;

    @Column(unique = true, length = 20)
    private String imoNumber;

    @Column(length = 20)
    private String callSign;

    @Column(length = 50)
    private String vesselType;

    @Column(precision = 12, scale = 2)
    private BigDecimal grossTonnage;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal netTonnage;

    @Column(precision = 12, scale = 2)
    private BigDecimal deadweightTonnage;

    @Column(precision = 8, scale = 2)
    private BigDecimal lengthOverall;

    @Column(precision = 8, scale = 2)
    private BigDecimal breadth;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal maximumDraft;

    @Column(nullable = false)
    @Builder.Default
    private Integer vesselLevel = 1;

    @Column(length = 50)
    private String flag;

    @Column(length = 100)
    private String owner;

    @Column(length = 100)
    private String operator;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
