package com.ptod.service;

import com.ptod.dto.AppointmentDTO;
import com.ptod.dto.CreateAppointmentRequest;
import com.ptod.dto.TimeSlotDTO;
import com.ptod.dto.UserDTO;
import com.ptod.entity.Appointment;
import com.ptod.entity.TimeSlot;
import com.ptod.entity.User;
import com.ptod.repository.AppointmentRepository;
import com.ptod.repository.TimeSlotRepository;
import com.ptod.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final UserRepository userRepository;

    @Transactional
    public AppointmentDTO createAppointment(Long parentId, CreateAppointmentRequest request) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("家长不存在"));

        if (parent.getRole() != User.Role.PARENT) {
            throw new RuntimeException("只有家长可以创建预约");
        }

        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("教师不存在"));

        TimeSlot timeSlot = timeSlotRepository.findByIdAndLockForUpdate(request.getTimeSlotId())
                .orElseThrow(() -> new RuntimeException("时间段不存在或已被预约"));

        if (!timeSlot.getTeacher().getId().equals(request.getTeacherId())) {
            throw new RuntimeException("时间段不属于该教师");
        }

        boolean hasActiveAppointment = appointmentRepository.existsByTimeSlotIdAndStatusIn(
                request.getTimeSlotId(),
                Arrays.asList(Appointment.AppointmentStatus.PENDING, Appointment.AppointmentStatus.CONFIRMED)
        );
        if (hasActiveAppointment) {
            throw new RuntimeException("该时间段已有有效预约");
        }

        Appointment appointment = new Appointment();
        appointment.setTeacher(teacher);
        appointment.setParent(parent);
        appointment.setTimeSlot(timeSlot);
        appointment.setStatus(Appointment.AppointmentStatus.PENDING);
        appointment.setAppointmentTime(LocalDateTime.of(
                timeSlot.getSlotDate(),
                timeSlot.getStartTime()
        ));
        appointment.setDuration(timeSlot.getDuration());
        appointment.setSubject(request.getSubject());
        appointment.setDescription(request.getDescription());

        timeSlot.setIsAvailable(false);
        timeSlotRepository.save(timeSlot);

        Appointment saved = appointmentRepository.save(appointment);
        return convertToDTO(saved);
    }

    public List<AppointmentDTO> getTeacherAppointments(Long teacherId) {
        return appointmentRepository.findByTeacherIdOrderByAppointmentTimeDesc(teacherId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getParentAppointments(Long parentId) {
        return appointmentRepository.findByParentIdOrderByAppointmentTimeDesc(parentId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getTeacherAppointmentsByStatus(Long teacherId, Appointment.AppointmentStatus status) {
        return appointmentRepository.findByTeacherIdAndStatus(teacherId, status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getParentAppointmentsByStatus(Long parentId, Appointment.AppointmentStatus status) {
        return appointmentRepository.findByParentIdAndStatus(parentId, status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentDTO confirmAppointment(Long teacherId, Long appointmentId) {
        Appointment appointment = appointmentRepository.findByIdAndLockForUpdate(appointmentId)
                .orElseThrow(() -> new RuntimeException("预约不存在"));

        if (!appointment.getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("无权确认此预约");
        }

        if (appointment.getStatus() != Appointment.AppointmentStatus.PENDING) {
            throw new RuntimeException("只有待确认的预约可以确认");
        }

        appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);
        Appointment saved = appointmentRepository.save(appointment);
        return convertToDTO(saved);
    }

    @Transactional
    public AppointmentDTO cancelAppointment(Long userId, Long appointmentId, User.Role userRole) {
        Appointment appointment = appointmentRepository.findByIdAndLockForUpdate(appointmentId)
                .orElseThrow(() -> new RuntimeException("预约不存在"));

        boolean isAuthorized = (userRole == User.Role.TEACHER && appointment.getTeacher().getId().equals(userId))
                || (userRole == User.Role.PARENT && appointment.getParent().getId().equals(userId));

        if (!isAuthorized) {
            throw new RuntimeException("无权取消此预约");
        }

        if (appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED
                || appointment.getStatus() == Appointment.AppointmentStatus.COMPLETED) {
            throw new RuntimeException("该预约无法取消");
        }

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);

        TimeSlot timeSlot = appointment.getTimeSlot();
        timeSlot.setIsAvailable(true);
        timeSlotRepository.save(timeSlot);

        Appointment saved = appointmentRepository.save(appointment);
        return convertToDTO(saved);
    }

    @Transactional
    public AppointmentDTO completeAppointment(Long userId, Long appointmentId) {
        Appointment appointment = appointmentRepository.findByIdAndLockForUpdate(appointmentId)
                .orElseThrow(() -> new RuntimeException("预约不存在"));

        boolean isParticipant = appointment.getTeacher().getId().equals(userId)
                || appointment.getParent().getId().equals(userId);

        if (!isParticipant) {
            throw new RuntimeException("无权完成此预约");
        }

        if (appointment.getStatus() != Appointment.AppointmentStatus.CONFIRMED
                && appointment.getStatus() != Appointment.AppointmentStatus.IN_PROGRESS) {
            throw new RuntimeException("该预约状态无法完成");
        }

        appointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
        Appointment saved = appointmentRepository.save(appointment);
        return convertToDTO(saved);
    }

    public AppointmentDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("预约不存在"));
        return convertToDTO(appointment);
    }

    private AppointmentDTO convertToDTO(Appointment appointment) {
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
