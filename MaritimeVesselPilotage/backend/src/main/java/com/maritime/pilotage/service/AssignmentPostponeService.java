package com.maritime.pilotage.service;

import com.maritime.pilotage.dto.AssignmentPostponeRequestDTO;
import com.maritime.pilotage.dto.AssignmentPostponeResultDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface AssignmentPostponeService {

    AssignmentPostponeResultDTO postponeAssignment(AssignmentPostponeRequestDTO request);

    void sendPostponeNotifications(Long assignmentId,
                                   Long originalAssignmentId,
                                   LocalDateTime originalTime,
                                   LocalDateTime newTime,
                                   String reason);

    String generateAssignmentNo();

    List<Long> getNotificationRecipients(Long orderId, Long pilotId);

    void createNotification(Long recipientId,
                            Integer recipientType,
                            String title,
                            String content,
                            Long relatedBusinessId,
                            String relatedBusinessType);
}
