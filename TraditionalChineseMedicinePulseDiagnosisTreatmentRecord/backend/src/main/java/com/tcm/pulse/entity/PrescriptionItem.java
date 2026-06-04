package com.tcm.pulse.entity;

import javax.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "prescription_item")
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "prescription_id", nullable = false)
    private Long prescriptionId;

    @Column(name = "herb_id")
    private Long herbId;

    @Column(name = "herb_name", nullable = false, length = 100)
    private String herbName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal dosage;

    @Column(name = "preparation_method", length = 50)
    private String preparationMethod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", insertable = false, updatable = false)
    @JsonIgnore
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "herb_id", insertable = false, updatable = false)
    @JsonIgnore
    private Herb herb;
}
