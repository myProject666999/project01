package com.ptod.service;

import com.ptod.dto.RatingDTO;
import com.ptod.entity.Appointment;
import com.ptod.entity.Rating;
import com.ptod.repository.AppointmentRepository;
import com.ptod.repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public RatingDTO createRating(Long parentId, Long appointmentId, Integer score, String comment) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("预约不存在"));

        if (!appointment.getParent().getId().equals(parentId)) {
            throw new RuntimeException("无权为此预约评分");
        }

        if (appointment.getStatus() != Appointment.AppointmentStatus.COMPLETED) {
            throw new RuntimeException("只有已完成的预约可以评分");
        }

        Optional<Rating> existingRating = ratingRepository.findByAppointmentId(appointmentId);
        if (existingRating.isPresent()) {
            throw new RuntimeException("该预约已被评分");
        }

        if (score < 1 || score > 5) {
            throw new RuntimeException("评分必须在1-5之间");
        }

        Rating rating = new Rating();
        rating.setAppointment(appointment);
        rating.setParent(appointment.getParent());
        rating.setTeacher(appointment.getTeacher());
        rating.setScore(score);
        rating.setComment(comment);

        Rating saved = ratingRepository.save(rating);
        return convertToDTO(saved);
    }

    public RatingDTO getRatingByAppointmentId(Long appointmentId) {
        Rating rating = ratingRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("评分不存在"));
        return convertToDTO(rating);
    }

    public List<RatingDTO> getTeacherRatings(Long teacherId) {
        return ratingRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Double getTeacherAverageRating(Long teacherId) {
        return ratingRepository.findAverageScoreByTeacherId(teacherId);
    }

    private RatingDTO convertToDTO(Rating rating) {
        RatingDTO dto = new RatingDTO();
        dto.setId(rating.getId());
        dto.setAppointmentId(rating.getAppointment().getId());
        dto.setParentId(rating.getParent().getId());
        dto.setParentName(rating.getParent().getName());
        dto.setTeacherId(rating.getTeacher().getId());
        dto.setScore(rating.getScore());
        dto.setComment(rating.getComment());
        dto.setCreatedAt(rating.getCreatedAt());
        return dto;
    }
}
