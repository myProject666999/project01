package com.ptod.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomTokenDTO {

    private Long id;
    private Long appointmentId;
    private Long userId;
    private String token;
    private String roomId;
    private Boolean used;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
