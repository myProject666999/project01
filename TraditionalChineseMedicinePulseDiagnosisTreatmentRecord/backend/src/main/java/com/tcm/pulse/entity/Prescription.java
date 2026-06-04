package com.tcm.pulse.entity;

import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "prescription")
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "consultation_id")
    private Long consultationId;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "total_dosage")
    private Integer totalDosage;

    @Column(name = "prescription_usage", columnDefinition = "TEXT")
    private String prescriptionUsage;

    @Column(name = "doctor_name", length = 100)
    private String doctorName;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    @JsonIgnore
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id", insertable = false, updatable = false)
    @JsonIgnore
    private Consultation consultation;

    @OneToMany(mappedBy = "prescription", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<PrescriptionItem> items;
}
