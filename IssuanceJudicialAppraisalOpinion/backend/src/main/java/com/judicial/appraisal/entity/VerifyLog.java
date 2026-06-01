package com.judicial.appraisal.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "verify_log")
public class VerifyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "verify_code", nullable = false, length = 64)
    private String verifyCode;

    @Column(name = "client_ip", length = 64)
    private String clientIp;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "verify_time")
    private LocalDateTime verifyTime;

    @Column(length = 32)
    private String result;
}
