package com.lawfirm.case_management.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "work_hour")
public class WorkHour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_id", nullable = false)
    private Long caseId;

    @Column(name = "lawyer_id", nullable = false)
    private Long lawyerId;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "work_minutes", nullable = false)
    private Integer workMinutes;

    @Column(name = "billing_units", nullable = false)
    private Integer billingUnits;

    @Column(name = "work_content", length = 500)
    private String workContent;

    @Column(name = "work_type", length = 50)
    private String workType;

    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "is_billed", columnDefinition = "TINYINT")
    private Integer isBilled = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", insertable = false, updatable = false)
    private LegalCase legalCase;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_id", insertable = false, updatable = false)
    private Lawyer lawyer;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void calculateBilling() {
        this.billingUnits = (int) Math.ceil(this.workMinutes / 6.0);
        if (this.hourlyRate != null) {
            BigDecimal ratePerUnit = this.hourlyRate.divide(new BigDecimal("10"), 2, BigDecimal.ROUND_HALF_UP);
            this.totalAmount = ratePerUnit.multiply(new BigDecimal(this.billingUnits));
        }
    }
}
