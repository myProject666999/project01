package com.ptod.service;

import com.ptod.dto.CreateSlotRequest;
import com.ptod.dto.TimeSlotDTO;
import com.ptod.entity.Appointment;
import com.ptod.entity.TimeSlot;
import com.ptod.entity.User;
import com.ptod.repository.AppointmentRepository;
import com.ptod.repository.TimeSlotRepository;
import com.ptod.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public TimeSlotDTO createTimeSlot(Long teacherId, CreateSlotRequest request) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("教师不存在"));

        if (teacher.getRole() != User.Role.TEACHER) {
            throw new RuntimeException("只有教师可以创建时间段");
        }

        boolean exists = timeSlotRepository.existsByTeacherAndSlotDateAndStartTimeAndEndTime(
                teacher, request.getSlotDate(), request.getStartTime(), request.getEndTime());
        if (exists) {
            throw new RuntimeException("该时间段已存在");
        }

        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setTeacher(teacher);
        timeSlot.setSlotDate(request.getSlotDate());
        timeSlot.setStartTime(request.getStartTime());
        timeSlot.setEndTime(request.getEndTime());
        timeSlot.setDuration(request.getDuration());
        timeSlot.setIsAvailable(true);

        TimeSlot saved = timeSlotRepository.save(timeSlot);
        return convertToDTO(saved);
    }

    public List<TimeSlotDTO> getTeacherTimeSlots(Long teacherId) {
        return timeSlotRepository.findByTeacherId(teacherId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TimeSlotDTO> getAvailableSlots(Long teacherId, LocalDate date) {
        return timeSlotRepository.findByTeacherIdAndSlotDateAndIsAvailableTrue(teacherId, date)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TimeSlotDTO> getUpcomingSlots(Long teacherId) {
        return timeSlotRepository.findByTeacherIdAndSlotDateAfterOrderBySlotDateAscStartTimeAsc(
                        teacherId, LocalDate.now())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteTimeSlot(Long teacherId, Long slotId) {
        TimeSlot timeSlot = timeSlotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("时间段不存在"));

        if (!timeSlot.getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("无权删除此时间段");
        }

        boolean hasActiveAppointment = appointmentRepository.existsByTimeSlotIdAndStatusIn(
                slotId,
                Arrays.asList(Appointment.AppointmentStatus.PENDING, Appointment.AppointmentStatus.CONFIRMED)
        );
        if (hasActiveAppointment) {
            throw new RuntimeException("该时间段有未完成的预约，无法删除");
        }

        timeSlotRepository.delete(timeSlot);
    }

    @Transactional
    public TimeSlotDTO toggleAvailability(Long teacherId, Long slotId) {
        TimeSlot timeSlot = timeSlotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("时间段不存在"));

        if (!timeSlot.getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("无权修改此时间段");
        }

        timeSlot.setIsAvailable(!timeSlot.getIsAvailable());
        TimeSlot saved = timeSlotRepository.save(timeSlot);
        return convertToDTO(saved);
    }

    private TimeSlotDTO convertToDTO(TimeSlot timeSlot) {
        TimeSlotDTO dto = new TimeSlotDTO();
        dto.setId(timeSlot.getId());
        dto.setTeacherId(timeSlot.getTeacher().getId());
        dto.setTeacherName(timeSlot.getTeacher().getName());
        dto.setSlotDate(timeSlot.getSlotDate());
        dto.setStartTime(timeSlot.getStartTime());
        dto.setEndTime(timeSlot.getEndTime());
        dto.setDuration(timeSlot.getDuration());
        dto.setIsAvailable(timeSlot.getIsAvailable());
        dto.setCreatedAt(timeSlot.getCreatedAt());
        return dto;
    }
}
