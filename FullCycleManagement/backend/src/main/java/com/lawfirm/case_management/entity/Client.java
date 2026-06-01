package com.lawfirm.case_management.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "client")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "normalized_name", length = 100)
    private String normalizedName;

    @Column(name = "id_card", length = 50)
    private String idCard;

    @Column(length = 20)
    private String phone;

    @Column(length = 300)
    private String address;

    @Column(name = "client_type", columnDefinition = "TINYINT")
    private Integer clientType = 1;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
