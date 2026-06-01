package com.ptod.controller;

import com.ptod.dto.ApiResponse;
import com.ptod.dto.RatingDTO;
import com.ptod.dto.TimeSlotDTO;
import com.ptod.dto.UserDTO;
import com.ptod.entity.User;
import com.ptod.service.RatingService;
import com.ptod.service.TimeSlotService;
import com.ptod.service.UserService;
import com.ptod.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final UserService userService;
    private final TimeSlotService timeSlotService;
    private final RatingService ratingService;
    private final SecurityUtil securityUtil;

    @GetMapping("/public")
    public ApiResponse<List<UserDTO>> getAllTeachers() {
        List<UserDTO> teachers = userService.getAllTeachers();
        return ApiResponse.success(teachers);
    }

    @GetMapping("/public/{teacherId}/slots")
    public ApiResponse<List<TimeSlotDTO>> getAvailableSlots(
            @PathVariable Long teacherId,
            @RequestParam(required = false) LocalDate date
    ) {
        if (date == null) {
            date = LocalDate.now();
        }
        List<TimeSlotDTO> slots = timeSlotService.getAvailableSlots(teacherId, date);
        return ApiResponse.success(slots);
    }

    @GetMapping("/public/{teacherId}/ratings")
    public ApiResponse<List<RatingDTO>> getTeacherRatings(@PathVariable Long teacherId) {
        List<RatingDTO> ratings = ratingService.getTeacherRatings(teacherId);
        return ApiResponse.success(ratings);
    }

    @GetMapping("/public/{teacherId}/average-rating")
    public ApiResponse<Double> getTeacherAverageRating(@PathVariable Long teacherId) {
        Double avgRating = ratingService.getTeacherAverageRating(teacherId);
        return ApiResponse.success(avgRating);
    }

    @GetMapping("/me/slots")
    @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<List<TimeSlotDTO>> getMySlots() {
        Long teacherId = securityUtil.getCurrentUserId();
        List<TimeSlotDTO> slots = timeSlotService.getTeacherTimeSlots(teacherId);
        return ApiResponse.success(slots);
    }

    @GetMapping("/me/upcoming-slots")
    @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<List<TimeSlotDTO>> getMyUpcomingSlots() {
        Long teacherId = securityUtil.getCurrentUserId();
        List<TimeSlotDTO> slots = timeSlotService.getUpcomingSlots(teacherId);
        return ApiResponse.success(slots);
    }
}
