package com.ptod.service;

import com.ptod.dto.*;
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

        if (appointment.getStatus() != Appointment.AppointmentStatus.CONFIRMED
                && appointment.getStatus() != Appointment.AppointmentStatus.IN_PROGRESS) {
            throw new RuntimeException("只有已确认的预约可以进入房间");
        }

        List<RoomToken> existingTokens = roomTokenRepository
                .findByAppointmentIdAndUserId(appointmentId, userId);
        for (RoomToken existing : existingTokens) {
            if (!existing.getUsed() && existing.getExpiresAt().isAfter(LocalDateTime.now())) {
                return convertToDTO(existing);
            }
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
        RoomToken roomToken = roomTokenRepository.findByToken(token)
                .orElse(null);

        if (roomToken == null) {
            return new VerifyTokenResponse(false, null, null, null, "令牌无效");
        }

        if (roomToken.getUsed() && roomToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return new VerifyTokenResponse(false, null, null, null, "令牌已过期");
        }

        if (roomToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return new VerifyTokenResponse(false, null, null, null, "令牌已过期");
        }

        Appointment appointment = roomToken.getAppointment();
        AppointmentDTO appointmentDTO = convertAppointmentToDTO(appointment);

        return new VerifyTokenResponse(
                true,
                appointment.getId(),
                roomToken.getUser().getId(),
                roomToken.getUser().getRole().name(),
                "验证成功",
                appointmentDTO
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
        dto.setRoomId("room-" + roomToken.getAppointment().getId());
        dto.setUsed(roomToken.getUsed());
        dto.setExpiresAt(roomToken.getExpiresAt());
        dto.setCreatedAt(roomToken.getCreatedAt());
        return dto;
    }

    private AppointmentDTO convertAppointmentToDTO(Appointment appointment) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        dto.setTeacherId(appointment.getTeacher().getId());
        dto.setParentId(appointment.getParent().getId());
        dto.setTimeSlotId(appointment.getTimeSlot().getId());
        dto.setStatusEnum(appointment.getStatus());
        dto.setAppointmentTime(appointment.getAppointmentTime());
        dto.setDuration(appointment.getDuration());
        dto.setSubject(appointment.getSubject());
        dto.setDescription(appointment.getDescription());
        dto.setRoomId("room-" + appointment.getId());
        dto.setCreatedAt(appointment.getCreatedAt());

        UserDTO teacherDTO = new UserDTO();
        teacherDTO.setId(appointment.getTeacher().getId());
        teacherDTO.setUsername(appointment.getTeacher().getUsername());
        teacherDTO.setName(appointment.getTeacher().getName());
        teacherDTO.setEmail(appointment.getTeacher().getEmail());
        teacherDTO.setPhone(appointment.getTeacher().getPhone());
        teacherDTO.setSubject(appointment.getTeacher().getSubject());
        teacherDTO.setRoleEnum(appointment.getTeacher().getRole());
        dto.setTeacher(teacherDTO);

        UserDTO parentDTO = new UserDTO();
        parentDTO.setId(appointment.getParent().getId());
        parentDTO.setUsername(appointment.getParent().getUsername());
        parentDTO.setName(appointment.getParent().getName());
        parentDTO.setEmail(appointment.getParent().getEmail());
        parentDTO.setPhone(appointment.getParent().getPhone());
        parentDTO.setRoleEnum(appointment.getParent().getRole());
        dto.setParent(parentDTO);

        TimeSlotDTO timeSlotDTO = new TimeSlotDTO();
        timeSlotDTO.setId(appointment.getTimeSlot().getId());
        timeSlotDTO.setTeacherId(appointment.getTimeSlot().getTeacher().getId());
        timeSlotDTO.setSlotDate(appointment.getTimeSlot().getSlotDate());
        timeSlotDTO.setStartTime(appointment.getTimeSlot().getStartTime());
        timeSlotDTO.setEndTime(appointment.getTimeSlot().getEndTime());
        timeSlotDTO.setDuration(appointment.getTimeSlot().getDuration());
        timeSlotDTO.setIsAvailable(appointment.getTimeSlot().getIsAvailable());
        timeSlotDTO.setCreatedAt(appointment.getTimeSlot().getCreatedAt());
        dto.setTimeSlot(timeSlotDTO);

        return dto;
    }
}
