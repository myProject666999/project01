package com.borderport.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bpc_queue_record")
public class QueueRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "port_id", nullable = false)
    private Long portId;

    @Column(name = "appointment_id", nullable = false)
    private Long appointmentId;

    @Column(name = "lane_name")
    private String laneName;

    @Column(length = 20)
    private String status = "WAITING";

    @Column(name = "queue_position")
    private Integer queuePosition = 0;

    @Column(name = "entered_at")
    private LocalDateTime enteredAt;

    @Column(name = "cleared_at")
    private LocalDateTime clearedAt;

    @PrePersist
    protected void onCreate() {
        enteredAt = LocalDateTime.now();
    }
}
