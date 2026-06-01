package com.ptod.service;

import com.ptod.dto.MeetingSummaryDTO;
import com.ptod.entity.Appointment;
import com.ptod.entity.MeetingSummary;
import com.ptod.entity.User;
import com.ptod.repository.AppointmentRepository;
import com.ptod.repository.MeetingSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SummaryService {

    private final MeetingSummaryRepository meetingSummaryRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public MeetingSummaryDTO saveTeacherNotes(Long teacherId, Long appointmentId, String notes) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("预约不存在"));

        if (!appointment.getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("无权编辑此预约的笔记");
        }

        if (appointment.getStatus() != Appointment.AppointmentStatus.COMPLETED) {
            throw new RuntimeException("只有已完成的预约可以添加笔记");
        }

        MeetingSummary summary = getOrCreateSummary(appointment);
        summary.setTeacherNotes(notes);

        MeetingSummary saved = meetingSummaryRepository.save(summary);
        return convertToDTO(saved);
    }

    @Transactional
    public MeetingSummaryDTO saveParentNotes(Long parentId, Long appointmentId, String notes) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("预约不存在"));

        if (!appointment.getParent().getId().equals(parentId)) {
            throw new RuntimeException("无权编辑此预约的笔记");
        }

        if (appointment.getStatus() != Appointment.AppointmentStatus.COMPLETED) {
            throw new RuntimeException("只有已完成的预约可以添加笔记");
        }

        MeetingSummary summary = getOrCreateSummary(appointment);
        summary.setParentNotes(notes);

        MeetingSummary saved = meetingSummaryRepository.save(summary);
        return convertToDTO(saved);
    }

    public MeetingSummaryDTO getSummaryByAppointmentId(Long appointmentId) {
        MeetingSummary summary = meetingSummaryRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("会议总结不存在"));
        return convertToDTO(summary);
    }

    private MeetingSummary getOrCreateSummary(Appointment appointment) {
        Optional<MeetingSummary> existingSummary = meetingSummaryRepository
                .findByAppointmentId(appointment.getId());

        return existingSummary.orElseGet(() -> {
            MeetingSummary newSummary = new MeetingSummary();
            newSummary.setAppointment(appointment);
            return newSummary;
        });
    }

    private MeetingSummaryDTO convertToDTO(MeetingSummary summary) {
        MeetingSummaryDTO dto = new MeetingSummaryDTO();
        dto.setId(summary.getId());
        dto.setAppointmentId(summary.getAppointment().getId());
        dto.setTeacherNotes(summary.getTeacherNotes());
        dto.setParentNotes(summary.getParentNotes());
        dto.setCreatedAt(summary.getCreatedAt());
        dto.setUpdatedAt(summary.getUpdatedAt());
        return dto;
    }
}
