package com.maritime.pilotage.service.impl;

import com.maritime.pilotage.dto.AssignmentPostponeRequestDTO;
import com.maritime.pilotage.dto.AssignmentPostponeResultDTO;
import com.maritime.pilotage.entity.PilotageAssignment;
import com.maritime.pilotage.entity.PilotageOrder;
import com.maritime.pilotage.entity.SystemNotification;
import com.maritime.pilotage.mapper.PilotageAssignmentMapper;
import com.maritime.pilotage.mapper.PilotageOrderMapper;
import com.maritime.pilotage.mapper.SystemNotificationMapper;
import com.maritime.pilotage.service.AssignmentPostponeService;
import com.maritime.pilotage.service.PilotScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssignmentPostponeServiceImpl implements AssignmentPostponeService {

    private static final int NOTIFICATION_TYPE_ASSIGNMENT_POSTPONE = 2;
    private static final int RECIPIENT_TYPE_PILOT = 1;
    private static final int RECIPIENT_TYPE_DISPATCHER = 2;
    private static final int RECIPIENT_TYPE_SHIP_COMPANY = 3;
    private static final String BUSINESS_TYPE_ASSIGNMENT = "PILOTAGE_ASSIGNMENT";

    private final PilotageAssignmentMapper assignmentMapper;
    private final PilotageOrderMapper orderMapper;
    private final SystemNotificationMapper notificationMapper;
    private final PilotScheduleService pilotScheduleService;

    @Override
    @Transactional
    public AssignmentPostponeResultDTO postponeAssignment(AssignmentPostponeRequestDTO request) {
        PilotageAssignment originalAssignment = assignmentMapper.selectById(request.getOriginalAssignmentId());
        if (originalAssignment == null) {
            throw new IllegalArgumentException("原任务不存在: " + request.getOriginalAssignmentId());
        }

        PilotageOrder order = orderMapper.selectById(originalAssignment.getOrderId());
        if (order == null) {
            throw new IllegalArgumentException("关联订单不存在");
        }

        Long pilotId = request.getNewPilotId() != null ? request.getNewPilotId() : originalAssignment.getPilotId();

        if (request.getNewPilotId() != null && !request.getNewPilotId().equals(originalAssignment.getPilotId())) {
            boolean isQualified = pilotScheduleService.checkPilotQualification(
                    pilotId, order.getVessel().getDeadweightTonnage(), order.getVessel().getVesselLevel());
            if (!isQualified) {
                throw new IllegalArgumentException("新指定的引航员资质不足");
            }

            boolean hasConsecutive = pilotScheduleService.hasConsecutiveShifts(pilotId, request.getNewPlannedPilotageTime());
            if (hasConsecutive) {
                throw new IllegalArgumentException("新指定的引航员存在连续两班情况");
            }
        }

        originalAssignment.setStatus(3);
        originalAssignment.setIsExtended(true);
        assignmentMapper.updateById(originalAssignment);

        String newAssignmentNo = generateAssignmentNo();
        PilotageAssignment newAssignment = PilotageAssignment.builder()
                .assignmentNo(newAssignmentNo)
                .orderId(originalAssignment.getOrderId())
                .pilotId(pilotId)
                .tideWindowStart(request.getNewTideWindowStart() != null ?
                        request.getNewTideWindowStart() : originalAssignment.getTideWindowStart())
                .tideWindowEnd(request.getNewTideWindowEnd() != null ?
                        request.getNewTideWindowEnd() : originalAssignment.getTideWindowEnd())
                .plannedPilotageTime(request.getNewPlannedPilotageTime())
                .pilotageDistance(originalAssignment.getPilotageDistance())
                .tugCount(originalAssignment.getTugCount())
                .status(1)
                .isExtended(true)
                .originalAssignmentId(originalAssignment.getId())
                .remark(buildPostponeRemark(originalAssignment, request))
                .build();

        assignmentMapper.insert(newAssignment);

        String pilotName = originalAssignment.getPilot() != null ?
                originalAssignment.getPilot().getName() : "未指派";

        List<Long> recipientIds = getNotificationRecipients(originalAssignment.getOrderId(), pilotId);

        sendPostponeNotifications(
                newAssignment.getId(),
                originalAssignment.getId(),
                originalAssignment.getPlannedPilotageTime(),
                request.getNewPlannedPilotageTime(),
                request.getPostponeReason()
        );

        log.info("任务顺延成功: 原任务ID={}, 新任务ID={}, 原计划时间={}, 新计划时间={}",
                originalAssignment.getId(), newAssignment.getId(),
                originalAssignment.getPlannedPilotageTime(), request.getNewPlannedPilotageTime());

        return AssignmentPostponeResultDTO.builder()
                .newAssignmentId(newAssignment.getId())
                .newAssignmentNo(newAssignmentNo)
                .originalAssignmentId(originalAssignment.getId())
                .originalPlannedTime(originalAssignment.getPlannedPilotageTime())
                .newPlannedTime(request.getNewPlannedPilotageTime())
                .pilotId(pilotId)
                .pilotName(pilotName)
                .notifiedRecipientIds(recipientIds)
                .notificationCount(recipientIds.size())
                .isSuccess(true)
                .message("任务顺延成功，已通知相关人员")
                .build();
    }

    @Override
    @Transactional
    public void sendPostponeNotifications(Long assignmentId,
                                          Long originalAssignmentId,
                                          LocalDateTime originalTime,
                                          LocalDateTime newTime,
                                          String reason) {
        PilotageAssignment assignment = assignmentMapper.selectById(assignmentId);
        if (assignment == null) {
            return;
        }

        PilotageOrder order = orderMapper.selectById(assignment.getOrderId());
        String vesselName = order != null && order.getVessel() != null ?
                order.getVessel().getVesselName() : "未知船舶";

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        String title = String.format("【任务顺延通知】%s 引航任务时间调整", vesselName);

        StringBuilder contentBuilder = new StringBuilder();
        contentBuilder.append(String.format("船舶「%s」的引航任务时间已调整。\n\n", vesselName));
        contentBuilder.append(String.format("原计划时间: %s\n", originalTime.format(formatter)));
        contentBuilder.append(String.format("新计划时间: %s\n", newTime.format(formatter)));
        if (reason != null && !reason.isEmpty()) {
            contentBuilder.append(String.format("顺延原因: %s\n", reason));
        }
        contentBuilder.append("\n请关注新的任务安排，提前做好准备工作。");
        contentBuilder.append(String.format("\n\n任务编号: %s", assignment.getAssignmentNo()));

        String content = contentBuilder.toString();

        List<Long> recipientIds = getNotificationRecipients(assignment.getOrderId(), assignment.getPilotId());

        for (Long recipientId : recipientIds) {
            int recipientType = determineRecipientType(recipientId, assignment.getPilotId());
            createNotification(
                    recipientId,
                    recipientType,
                    title,
                    content,
                    assignmentId,
                    BUSINESS_TYPE_ASSIGNMENT
            );
        }

        log.info("已发送任务顺延通知: 任务ID={}, 通知人数={}", assignmentId, recipientIds.size());
    }

    @Override
    public String generateAssignmentNo() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "PA" + datePart + randomPart;
    }

    @Override
    public List<Long> getNotificationRecipients(Long orderId, Long pilotId) {
        List<Long> recipients = new ArrayList<>();

        if (pilotId != null) {
            recipients.add(pilotId);
        }

        recipients.add(1L);
        recipients.add(2L);

        PilotageOrder order = orderMapper.selectById(orderId);
        if (order != null && order.getVessel() != null) {
            recipients.add(order.getVessel().getId() + 1000);
        }

        return recipients;
    }

    @Override
    @Transactional
    public void createNotification(Long recipientId,
                                   Integer recipientType,
                                   String title,
                                   String content,
                                   Long relatedBusinessId,
                                   String relatedBusinessType) {
        SystemNotification notification = SystemNotification.builder()
                .notificationType(NOTIFICATION_TYPE_ASSIGNMENT_POSTPONE)
                .recipientType(recipientType)
                .recipientId(recipientId)
                .title(title)
                .content(content)
                .relatedBusinessId(relatedBusinessId)
                .relatedBusinessType(relatedBusinessType)
                .isRead(false)
                .build();

        notificationMapper.insert(notification);
    }

    private String buildPostponeRemark(PilotageAssignment original, AssignmentPostponeRequestDTO request) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        StringBuilder remark = new StringBuilder();
        remark.append("任务顺延\n");
        remark.append(String.format("原计划时间: %s\n", original.getPlannedPilotageTime().format(formatter)));
        remark.append(String.format("新计划时间: %s\n", request.getNewPlannedPilotageTime().format(formatter)));
        if (request.getPostponeReason() != null) {
            remark.append(String.format("顺延原因: %s\n", request.getPostponeReason()));
        }
        if (request.getOperator() != null) {
            remark.append(String.format("操作人: %s\n", request.getOperator()));
        }
        remark.append(String.format("顺延时间: %s", LocalDateTime.now().format(formatter)));
        return remark.toString();
    }

    private int determineRecipientType(Long recipientId, Long pilotId) {
        if (pilotId != null && recipientId.equals(pilotId)) {
            return RECIPIENT_TYPE_PILOT;
        } else if (recipientId < 100) {
            return RECIPIENT_TYPE_DISPATCHER;
        } else {
            return RECIPIENT_TYPE_SHIP_COMPANY;
        }
    }
}
