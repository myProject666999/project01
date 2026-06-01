package com.ptod.websocket;

import com.ptod.dto.VerifyTokenResponse;
import com.ptod.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebRtcSignalHandler implements HandshakeHandler {

    private final RoomService roomService;
    private final DefaultHandshakeHandler defaultHandshakeHandler = new DefaultHandshakeHandler();

    @Override
    public boolean doHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String path = request.getURI().getPath();
        String appointmentId = path.substring(path.lastIndexOf('/') + 1);

        String query = request.getURI().getQuery();
        String token = null;
        if (query != null) {
            for (String param : query.split("&")) {
                String[] pair = param.split("=");
                if (pair.length == 2 && "token".equals(pair[0])) {
                    token = pair[1];
                    break;
                }
            }
        }

        if (token == null) {
            log.warn("WebSocket连接缺少token参数");
            return false;
        }

        VerifyTokenResponse verifyResult = roomService.verifyToken(token);
        if (!verifyResult.isValid()) {
            log.warn("WebSocket连接token验证失败: {}", verifyResult.getMessage());
            return false;
        }

        if (!appointmentId.equals(verifyResult.getAppointmentId().toString())) {
            log.warn("WebSocket连接appointmentId不匹配");
            return false;
        }

        attributes.put("userId", verifyResult.getUserId());
        attributes.put("userRole", verifyResult.getUserRole());
        attributes.put("appointmentId", verifyResult.getAppointmentId());

        Principal principal = new Principal() {
            @Override
            public String getName() {
                return verifyResult.getUserId().toString();
            }
        };
        attributes.put("principal", principal);

        log.info("WebSocket连接成功: userId={}, appointmentId={}, role={}",
                verifyResult.getUserId(), verifyResult.getAppointmentId(), verifyResult.getUserRole());

        return defaultHandshakeHandler.doHandshake(request, response, wsHandler, attributes);
    }
}
