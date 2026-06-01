package com.maritime.pilotage.entity;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pilotage_billing", indexes = {
        @Index(name = "idx_billing_no", columnList = "billingNo"),
        @Index(name = "idx_order_id", columnList = "orderId"),
        @Index(name = "idx_billing_status", columnList = "billingStatus")
})
public class PilotageBilling {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 30)
    private String billingNo;

    @Column(nullable = false)
    private Long completionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completionId", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "fk_pilotage_billing_completion"))
    private PilotageCompletion completion;

    @Column(nullable = false)
    private Long orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orderId", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "fk_pilotage_billing_order"))
    private PilotageOrder order;

    @Column(nullable = false)
    private Long vesselId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vesselId", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "fk_pilotage_billing_vessel"))
    private Vessel vessel;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal netTonnage;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal pilotageDistance;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal baseFee;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal tonnageFee;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal distanceFee;

    @Column(precision = 12, scale = 2)
    private BigDecimal tugFee;

    @Builder.Default
    @Column(precision = 12, scale = 2)
    private BigDecimal nightSurcharge = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 12, scale = 2)
    private BigDecimal weekendSurcharge = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 12, scale = 2)
    private BigDecimal holidaySurcharge = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 12, scale = 2)
    private BigDecimal otherFee = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 12, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Builder.Default
    private Integer billingStatus = 1;

    private LocalDate billingDate;

    private LocalDate paidDate;

    @Column(columnDefinition = "TEXT")
    private String remark;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
