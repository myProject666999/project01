package com.ptod.controller;

import com.ptod.dto.ApiResponse;
import com.ptod.dto.CreateSlotRequest;
import com.ptod.dto.TimeSlotDTO;
import com.ptod.entity.User;
import com.ptod.service.TimeSlotService;
import com.ptod.util.SecurityUtil;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/time-slots")
@RequiredArgsConstructor
public class TimeSlotController {

    private final TimeSlotService timeSlotService;
    private final SecurityUtil securityUtil;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<TimeSlotDTO> createTimeSlot(@Valid @RequestBody CreateSlotRequest request) {
        Long teacherId = securityUtil.getCurrentUserId();
        TimeSlotDTO slot = timeSlotService.createTimeSlot(teacherId, request);
        return ApiResponse.success("创建成功", slot);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<Void> deleteTimeSlot(@PathVariable Long id) {
        Long teacherId = securityUtil.getCurrentUserId();
        timeSlotService.deleteTimeSlot(teacherId, id);
        return ApiResponse.success("删除成功", null);
    }

    @PutMapping("/{id}/toggle-availability")
    @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<TimeSlotDTO> toggleAvailability(@PathVariable Long id) {
        Long teacherId = securityUtil.getCurrentUserId();
        TimeSlotDTO slot = timeSlotService.toggleAvailability(teacherId, id);
        return ApiResponse.success("更新成功", slot);
    }
}
