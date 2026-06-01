package com.ptod.controller;

import com.ptod.dto.ApiResponse;
import com.ptod.dto.MeetingSummaryDTO;
import com.ptod.dto.RatingDTO;
import com.ptod.entity.User;
import com.ptod.service.RatingService;
import com.ptod.service.SummaryService;
import com.ptod.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/summary")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;
    private final RatingService ratingService;
    private final SecurityUtil securityUtil;

    @PutMapping("/teacher/{appointmentId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<MeetingSummaryDTO> saveTeacherNotes(
            @PathVariable Long appointmentId,
            @RequestBody String notes
    ) {
        Long teacherId = securityUtil.getCurrentUserId();
        MeetingSummaryDTO summary = summaryService.saveTeacherNotes(teacherId, appointmentId, notes);
        return ApiResponse.success("保存成功", summary);
    }

    @PutMapping("/parent/{appointmentId}")
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<MeetingSummaryDTO> saveParentNotes(
            @PathVariable Long appointmentId,
            @RequestBody String notes
    ) {
        Long parentId = securityUtil.getCurrentUserId();
        MeetingSummaryDTO summary = summaryService.saveParentNotes(parentId, appointmentId, notes);
        return ApiResponse.success("保存成功", summary);
    }

    @GetMapping("/{appointmentId}")
    public ApiResponse<MeetingSummaryDTO> getSummary(@PathVariable Long appointmentId) {
        MeetingSummaryDTO summary = summaryService.getSummaryByAppointmentId(appointmentId);
        return ApiResponse.success(summary);
    }

    @PostMapping("/rating/{appointmentId}")
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<RatingDTO> createRating(
            @PathVariable Long appointmentId,
            @RequestParam Integer score,
            @RequestParam(required = false) String comment
    ) {
        Long parentId = securityUtil.getCurrentUserId();
        RatingDTO rating = ratingService.createRating(parentId, appointmentId, score, comment);
        return ApiResponse.success("评分成功", rating);
    }

    @GetMapping("/rating/{appointmentId}")
    public ApiResponse<RatingDTO> getRating(@PathVariable Long appointmentId) {
        RatingDTO rating = ratingService.getRatingByAppointmentId(appointmentId);
        return ApiResponse.success(rating);
    }
}
