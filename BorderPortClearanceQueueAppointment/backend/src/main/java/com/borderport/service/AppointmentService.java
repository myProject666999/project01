package com.borderport.service;

import com.borderport.dto.AppointmentCreateDTO;
import com.borderport.dto.AppointmentDTO;
import com.borderport.entity.Appointment;
import com.borderport.repository.AppointmentRepository;
import com.borderport.repository.PortRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final QuotaService quotaService;
    private final PortRepository portRepository;

    private final Random random = new Random();

    public AppointmentDTO createAppointment(AppointmentCreateDTO dto) {
        boolean success = quotaService.deductQuota(dto.getPortId(), dto.getVehicleType(),
                dto.getAppointmentDate(), dto.getTimeSlot());
        if (!success) {
            throw new RuntimeException("配额已满");
        }

        String appointmentNo = generateAppointmentNo();
        String qrCode = appointmentNo + "|" + dto.getPlateNumber() + "|"
                + dto.getAppointmentDate() + "|" + dto.getTimeSlot();

        Appointment appointment = new Appointment();
        appointment.setAppointmentNo(appointmentNo);
        appointment.setPortId(dto.getPortId());
        appointment.setVehicleType(dto.getVehicleType());
        appointment.setPlateNumber(dto.getPlateNumber());
        appointment.setDriverName(dto.getDriverName());
        appointment.setDriverPhone(dto.getDriverPhone());
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setTimeSlot(dto.getTimeSlot());
        appointment.setQrCode(qrCode);
        appointment.setStatus("BOOKED");

        Appointment saved = appointmentRepository.save(appointment);
        return convertToDTO(saved);
    }

    public AppointmentDTO getAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("预约不存在"));
        return convertToDTO(appointment);
    }

    public AppointmentDTO getAppointmentByNo(String appointmentNo) {
        Appointment appointment = appointmentRepository.findByAppointmentNo(appointmentNo)
                .orElseThrow(() -> new RuntimeException("预约不存在"));
        return convertToDTO(appointment);
    }

    public AppointmentDTO cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("预约不存在"));
        appointment.setStatus("CANCELLED");
        quotaService.releaseQuota(appointment.getPortId(), appointment.getVehicleType(),
                appointment.getAppointmentDate(), appointment.getTimeSlot());
        Appointment saved = appointmentRepository.save(appointment);
        return convertToDTO(saved);
    }

    public List<AppointmentDTO> getDriverAppointments(String phone) {
        return appointmentRepository.findByDriverPhone(phone).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private String generateAppointmentNo() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String fourDigit = String.format("%04d", random.nextInt(10000));
        return "BPC" + timestamp + fourDigit;
    }

    private AppointmentDTO convertToDTO(Appointment appointment) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        dto.setAppointmentNo(appointment.getAppointmentNo());
        dto.setPortId(appointment.getPortId());
        dto.setQuotaId(appointment.getQuotaId());
        dto.setVehicleType(appointment.getVehicleType());
        dto.setPlateNumber(appointment.getPlateNumber());
        dto.setDriverName(appointment.getDriverName());
        dto.setDriverPhone(appointment.getDriverPhone());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setTimeSlot(appointment.getTimeSlot());
        dto.setQrCode(appointment.getQrCode());
        dto.setStatus(appointment.getStatus());
        dto.setCheckinLatitude(appointment.getCheckinLatitude());
        dto.setCheckinLongitude(appointment.getCheckinLongitude());
        dto.setCheckinTime(appointment.getCheckinTime());

        portRepository.findById(appointment.getPortId())
                .ifPresent(port -> dto.setPortName(port.getName()));
        return dto;
    }
}
