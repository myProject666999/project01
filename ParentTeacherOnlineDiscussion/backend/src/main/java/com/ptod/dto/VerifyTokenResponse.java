package com.ptod.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyTokenResponse {

    private boolean valid;
    private Long appointmentId;
    private Long userId;
    private String userRole;
    private String message;
}
