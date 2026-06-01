package com.ptod.controller;

import com.ptod.dto.ApiResponse;
import com.ptod.dto.RoomTokenDTO;
import com.ptod.dto.VerifyTokenResponse;
import com.ptod.service.RoomService;
import com.ptod.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/room")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final SecurityUtil securityUtil;

    @PostMapping("/token/{appointmentId}")
    public ApiResponse<RoomTokenDTO> generateToken(@PathVariable Long appointmentId) {
        Long userId = securityUtil.getCurrentUserId();
        RoomTokenDTO token = roomService.generateToken(appointmentId, userId);
        return ApiResponse.success("令牌生成成功", token);
    }

    @GetMapping("/verify/{token}")
    public ApiResponse<VerifyTokenResponse> verifyToken(@PathVariable String token) {
        VerifyTokenResponse response = roomService.verifyToken(token);
        return ApiResponse.success(response);
    }

    @GetMapping("/tokens/{appointmentId}")
    public ApiResponse<List<RoomTokenDTO>> getRoomTokens(@PathVariable Long appointmentId) {
        List<RoomTokenDTO> tokens = roomService.getRoomTokens(appointmentId);
        return ApiResponse.success(tokens);
    }
}
