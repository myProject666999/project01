package com.ptod.controller;

import com.ptod.dto.ApiResponse;
import com.ptod.dto.AppointmentDTO;
import com.ptod.dto.CreateAppointmentRequest;
import com.ptod.entity.Appointment;
import com.ptod.entity.User;
import com.ptod.service.AppointmentService;
import com.ptod.util.SecurityUtil;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final SecurityUtil securityUtil;

    @PostMapping
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<AppointmentDTO> createAppointment(@Valid @RequestBody CreateAppointmentRequest request) {
        Long parentId = securityUtil.getCurrentUserId();
        AppointmentDTO appointment = appointmentService.createAppointment(parentId, request);
        return ApiResponse.success("预约成功", appointment);
    }

    @GetMapping("/me")
    public ApiResponse<List<AppointmentDTO>> getMyAppointments() {
        Long userId = securityUtil.getCurrentUserId();
        User.Role role = securityUtil.getCurrentUserRole();
        List<AppointmentDTO> appointments;
        if (role == User.Role.TEACHER) {
            appointments = appointmentService.getTeacherAppointments(userId);
        } else {
            appointments = appointmentService.getParentAppointments(userId);
        }
        return ApiResponse.success(appointments);
    }

    @GetMapping("/me/status/{status}")
    public ApiResponse<List<AppointmentDTO>> getMyAppointmentsByStatus(@PathVariable Appointment.AppointmentStatus status) {
        Long userId = securityUtil.getCurrentUserId();
        User.Role role = securityUtil.getCurrentUserRole();
        List<AppointmentDTO> appointments;
        if (role == User.Role.TEACHER) {
            appointments = appointmentService.getTeacherAppointmentsByStatus(userId, status);
        } else {
            appointments = appointmentService.getParentAppointmentsByStatus(userId, status);
        }
        return ApiResponse.success(appointments);
    }

    @GetMapping("/{id}")
    public ApiResponse<AppointmentDTO> getAppointmentById(@PathVariable Long id) {
        AppointmentDTO appointment = appointmentService.getAppointmentById(id);
        return ApiResponse.success(appointment);
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<AppointmentDTO> confirmAppointment(@PathVariable Long id) {
        Long teacherId = securityUtil.getCurrentUserId();
        AppointmentDTO appointment = appointmentService.confirmAppointment(teacherId, id);
        return ApiResponse.success("确认成功", appointment);
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<AppointmentDTO> cancelAppointment(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        User.Role role = securityUtil.getCurrentUserRole();
        AppointmentDTO appointment = appointmentService.cancelAppointment(userId, id, role);
        return ApiResponse.success("取消成功", appointment);
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<AppointmentDTO> completeAppointment(@PathVariable Long id) {
        Long teacherId = securityUtil.getCurrentUserId();
        AppointmentDTO appointment = appointmentService.completeAppointment(teacherId, id);
        return ApiResponse.success("完成成功", appointment);
    }
}
