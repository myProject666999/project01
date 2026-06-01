package com.borderport.controller;

import com.borderport.common.Result;
import com.borderport.dto.AppointmentCreateDTO;
import com.borderport.dto.AppointmentDTO;
import com.borderport.dto.CheckInDTO;
import com.borderport.service.AppointmentService;
import com.borderport.service.CheckInService;
import com.borderport.service.QuotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final CheckInService checkInService;
    private final QuotaService quotaService;

    @GetMapping("/quotas")
    public Result<List> getQuotas(
            @RequestParam Long portId,
            @RequestParam String vehicleType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return Result.ok(quotaService.getQuotas(portId, vehicleType, date));
    }

    @PostMapping
    public Result<AppointmentDTO> create(@RequestBody AppointmentCreateDTO dto) {
        return Result.ok(appointmentService.createAppointment(dto));
    }

    @GetMapping("/{id}")
    public Result<AppointmentDTO> getById(@PathVariable Long id) {
        return Result.ok(appointmentService.getAppointment(id));
    }

    @GetMapping("/no/{appointmentNo}")
    public Result<AppointmentDTO> getByNo(@PathVariable String appointmentNo) {
        return Result.ok(appointmentService.getAppointmentByNo(appointmentNo));
    }

    @DeleteMapping("/{id}")
    public Result cancel(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return Result.ok();
    }

    @GetMapping("/phone/{phone}")
    public Result<List<AppointmentDTO>> getByPhone(@PathVariable String phone) {
        return Result.ok(appointmentService.getDriverAppointments(phone));
    }

    @PostMapping("/check-in")
    public Result<AppointmentDTO> checkIn(@RequestBody CheckInDTO dto) {
        return Result.ok(checkInService.checkIn(dto));
    }
}
