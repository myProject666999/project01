package com.maritime.pilotage.entity;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "system_notification", indexes = {
        @Index(name = "idx_recipient", columnList = "recipientType, recipientId"),
        @Index(name = "idx_is_read", columnList = "isRead"),
        @Index(name = "idx_created_at", columnList = "createdAt")
})
public class SystemNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer notificationType;

    @Column(nullable = false)
    private Integer recipientType;

    private Long recipientId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private Long relatedBusinessId;

    @Column(length = 50)
    private String relatedBusinessType;

    @Builder.Default
    private Boolean isRead = false;

    private LocalDateTime readAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
