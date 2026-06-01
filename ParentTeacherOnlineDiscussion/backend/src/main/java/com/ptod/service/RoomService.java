package com.ptod.service;

import com.ptod.dto.RoomTokenDTO;
import com.ptod.dto.VerifyTokenResponse;
import com.ptod.entity.Appointment;
import com.ptod.entity.RoomToken;
import com.ptod.entity.User;
import com.ptod.repository.AppointmentRepository;
import com.ptod.repository.RoomTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomTokenRepository roomTokenRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public RoomTokenDTO generateToken(Long appointmentId, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("预约不存在"));

        boolean isParticipant = appointment.getTeacher().getId().equals(userId)
                || appointment.getParent().getId().equals(userId);

        if (!isParticipant) {
            throw new RuntimeException("您不是该预约的参与者");
        }

        if (appointment.getStatus() != Appointment.AppointmentStatus.CONFIRMED) {
            throw new RuntimeException("只有已确认的预约可以进入房间");
        }

        boolean hasUnusedToken = roomTokenRepository.existsByAppointmentIdAndUserIdAndUsedFalse(
                appointmentId, userId);
        if (hasUnusedToken) {
            throw new RuntimeException("您已有有效的房间令牌");
        }

        RoomToken roomToken = new RoomToken();
        roomToken.setAppointment(appointment);
        roomToken.setUser(appointment.getTeacher().getId().equals(userId)
                ? appointment.getTeacher() : appointment.getParent());
        roomToken.setToken(UUID.randomUUID().toString());
        roomToken.setUsed(false);
        roomToken.setExpiresAt(LocalDateTime.now().plusHours(2));

        RoomToken saved = roomTokenRepository.save(roomToken);
        return convertToDTO(saved);
    }

    @Transactional
    public VerifyTokenResponse verifyToken(String token) {
        RoomToken roomToken = roomTokenRepository.findValidTokenAndLock(
                        token, LocalDateTime.now())
                .orElse(null);

        if (roomToken == null) {
            return new VerifyTokenResponse(false, null, null, null, "令牌无效或已过期");
        }

        if (roomToken.getUsed()) {
            return new VerifyTokenResponse(false, null, null, null, "令牌已被使用");
        }

        roomToken.setUsed(true);
        roomTokenRepository.save(roomToken);

        return new VerifyTokenResponse(
                true,
                roomToken.getAppointment().getId(),
                roomToken.getUser().getId(),
                roomToken.getUser().getRole().name(),
                "验证成功"
        );
    }

    public List<RoomTokenDTO> getRoomTokens(Long appointmentId) {
        return roomTokenRepository.findByAppointmentId(appointmentId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private RoomTokenDTO convertToDTO(RoomToken roomToken) {
        RoomTokenDTO dto = new RoomTokenDTO();
        dto.setId(roomToken.getId());
        dto.setAppointmentId(roomToken.getAppointment().getId());
        dto.setUserId(roomToken.getUser().getId());
        dto.setToken(roomToken.getToken());
        dto.setUsed(roomToken.getUsed());
        dto.setExpiresAt(roomToken.getExpiresAt());
        dto.setCreatedAt(roomToken.getCreatedAt());
        return dto;
    }
}
