package com.ptod.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WebRtcSignalController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/webrtc/{appointmentId}/offer")
    public void handleOffer(
            @DestinationVariable String appointmentId,
            @Payload Map<String, Object> offer,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());
        log.info("收到WebRTC Offer: appointmentId={}, from={}", appointmentId, userId);

        Map<String, Object> message = new HashMap<>();
        message.put("from", userId);
        message.put("sdp", offer.get("sdp"));
        message.put("type", offer.get("type"));

        messagingTemplate.convertAndSend(
                "/topic/webrtc/" + appointmentId + "/offer",
                message
        );
    }

    @MessageMapping("/webrtc/{appointmentId}/answer")
    public void handleAnswer(
            @DestinationVariable String appointmentId,
            @Payload Map<String, Object> answer,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());
        log.info("收到WebRTC Answer: appointmentId={}, from={}", appointmentId, userId);

        Map<String, Object> message = new HashMap<>();
        message.put("from", userId);
        message.put("sdp", answer.get("sdp"));
        message.put("type", answer.get("type"));

        messagingTemplate.convertAndSend(
                "/topic/webrtc/" + appointmentId + "/answer",
                message
        );
    }

    @MessageMapping("/webrtc/{appointmentId}/ice")
    public void handleIceCandidate(
            @DestinationVariable String appointmentId,
            @Payload Map<String, Object> iceCandidate,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());
        log.info("收到ICE候选: appointmentId={}, from={}", appointmentId, userId);

        Map<String, Object> message = new HashMap<>();
        message.put("from", userId);
        message.put("candidate", iceCandidate.get("candidate"));
        message.put("sdpMid", iceCandidate.get("sdpMid"));
        message.put("sdpMLineIndex", iceCandidate.get("sdpMLineIndex"));

        messagingTemplate.convertAndSend(
                "/topic/webrtc/" + appointmentId + "/ice",
                message
        );
    }

    @MessageMapping("/webrtc/{appointmentId}/hangup")
    public void handleHangup(
            @DestinationVariable String appointmentId,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());
        log.info("收到挂断请求: appointmentId={}, from={}", appointmentId, userId);

        Map<String, Object> message = new HashMap<>();
        message.put("from", userId);

        messagingTemplate.convertAndSend(
                "/topic/webrtc/" + appointmentId + "/hangup",
                message
        );
    }

    @MessageMapping("/webrtc/{appointmentId}/join")
    public void handleJoin(
            @DestinationVariable String appointmentId,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());
        log.info("用户加入房间: appointmentId={}, userId={}", appointmentId, userId);

        Map<String, Object> message = new HashMap<>();
        message.put("userId", userId);

        messagingTemplate.convertAndSend(
                "/topic/webrtc/" + appointmentId + "/user-joined",
                message
        );
    }

    @MessageMapping("/webrtc/{appointmentId}/leave")
    public void handleLeave(
            @DestinationVariable String appointmentId,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());
        log.info("用户离开房间: appointmentId={}, userId={}", appointmentId, userId);

        Map<String, Object> message = new HashMap<>();
        message.put("userId", userId);

        messagingTemplate.convertAndSend(
                "/topic/webrtc/" + appointmentId + "/user-left",
                message
        );
    }
}
