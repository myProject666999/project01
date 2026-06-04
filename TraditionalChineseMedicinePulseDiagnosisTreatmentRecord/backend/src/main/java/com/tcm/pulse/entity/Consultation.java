package com.tcm.pulse.entity;

import javax.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "consultation")
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(columnDefinition = "TEXT")
    private String complexion;

    @Column(name = "tongue_appearance", columnDefinition = "TEXT")
    private String tongueAppearance;

    @Column(name = "tongue_image_url", length = 500)
    private String tongueImageUrl;

    @Column(columnDefinition = "TEXT")
    private String breath;

    @Column(columnDefinition = "TEXT")
    private String cough;

    @Column(columnDefinition = "TEXT")
    private String voice;

    @Column(name = "chief_complaint", columnDefinition = "TEXT", nullable = false)
    private String chiefComplaint;

    @Column(name = "associated_symptoms", columnDefinition = "TEXT")
    private String associatedSymptoms;

    @Column(columnDefinition = "TEXT")
    private String stool;

    @Column(columnDefinition = "TEXT")
    private String urine;

    @Column(name = "pulse_types", length = 200)
    private String pulseTypes;

    @Column(name = "visit_date", nullable = false)
    private LocalDateTime visitDate;

    @Column(columnDefinition = "TEXT")
    private String remark;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    @JsonIgnore
    private Patient patient;
}
