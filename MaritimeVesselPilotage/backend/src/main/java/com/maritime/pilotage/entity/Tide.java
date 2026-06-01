package com.maritime.pilotage.entity;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tide", uniqueConstraints = {
        @UniqueConstraint(name = "uk_date_time", columnNames = {"tideDate", "tideTime", "port"})
}, indexes = {
        @Index(name = "idx_tide_date", columnList = "tideDate")
})
public class Tide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate tideDate;

    @Column(nullable = false)
    private LocalTime tideTime;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal tideHeight;

    @Column(nullable = false)
    private Integer tideType;

    @Builder.Default
    @Column(length = 50)
    private String port = "Main Port";

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
