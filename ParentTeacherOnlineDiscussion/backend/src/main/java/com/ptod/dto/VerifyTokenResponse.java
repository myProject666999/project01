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
    private AppointmentDTO appointment;

    public VerifyTokenResponse(boolean valid, Long appointmentId, Long userId, String userRole, String message) {
        this.valid = valid;
        this.appointmentId = appointmentId;
        this.userId = userId;
        this.userRole = userRole;
        this.message = message;
    }
}
