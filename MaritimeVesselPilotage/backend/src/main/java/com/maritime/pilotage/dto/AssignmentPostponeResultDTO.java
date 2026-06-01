package com.maritime.pilotage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentPostponeResultDTO {

    private Long newAssignmentId;

    private String newAssignmentNo;

    private Long originalAssignmentId;

    private LocalDateTime originalPlannedTime;

    private LocalDateTime newPlannedTime;

    private Long pilotId;

    private String pilotName;

    private List<Long> notifiedRecipientIds;

    private Integer notificationCount;

    private Boolean isSuccess;

    private String message;
}
