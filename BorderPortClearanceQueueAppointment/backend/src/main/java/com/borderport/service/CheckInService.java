package com.borderport.service;

import com.borderport.dto.AppointmentDTO;
import com.borderport.dto.CheckInDTO;
import com.borderport.entity.Appointment;
import com.borderport.entity.Lane;
import com.borderport.entity.Port;
import com.borderport.entity.QueueRecord;
import com.borderport.repository.AppointmentRepository;
import com.borderport.repository.LaneRepository;
import com.borderport.repository.PortRepository;
import com.borderport.repository.QueueRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CheckInService {

    private final AppointmentRepository appointmentRepository;
    private final QueueRecordRepository queueRecordRepository;
    private final PortRepository portRepository;
    private final LaneRepository laneRepository;

    @Value("${app.gps.check-radius:1000}")
    private int checkRadius;

    public AppointmentDTO checkIn(CheckInDTO dto) {
        Appointment appointment = appointmentRepository.findByAppointmentNo(dto.getAppointmentNo())
                .orElseThrow(() -> new RuntimeException("预约不存在"));

        if (!"BOOKED".equals(appointment.getStatus())) {
            throw new RuntimeException("预约状态不正确");
        }

        if (!appointment.getPlateNumber().equals(dto.getPlateNumber())) {
            throw new RuntimeException("车牌号不匹配");
        }

        Port port = portRepository.findById(appointment.getPortId())
                .orElseThrow(() -> new RuntimeException("口岸不存在"));

        double distance = haversineDistance(dto.getLatitude(), dto.getLongitude(),
                port.getLatitude(), port.getLongitude());

        if (distance > checkRadius) {
            throw new RuntimeException("不在口岸范围内");
        }

        appointment.setStatus("CHECKED_IN");
        appointment.setCheckinLatitude(dto.getLatitude());
        appointment.setCheckinLongitude(dto.getLongitude());
        appointment.setCheckinTime(LocalDateTime.now());
        appointmentRepository.save(appointment);

        String laneName = resolveLaneName(appointment.getPortId(), appointment.getVehicleType());

        QueueRecord record = new QueueRecord();
        record.setPortId(appointment.getPortId());
        record.setAppointmentId(appointment.getId());
        record.setLaneName(laneName);
        record.setStatus("WAITING");
        int waitingCount = queueRecordRepository.countByPortIdAndStatus(appointment.getPortId(), "WAITING");
        record.setQueuePosition(waitingCount + 1);
        queueRecordRepository.save(record);

        return convertToDTO(appointment);
    }

    private String resolveLaneName(Long portId, String vehicleType) {
        String laneType = "CARGO".equals(vehicleType) ? "CARGO" : "PASSENGER";
        List<Lane> lanes = laneRepository.findByPortIdAndLaneType(portId, laneType);
        if (!lanes.isEmpty()) {
            return lanes.get(0).getLaneName();
        }
        return vehicleType + "_LANE";
    }

    private double haversineDistance(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        double earthRadius = 6371000;
        double dLat = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double dLon = Math.toRadians(lon2.doubleValue() - lon1.doubleValue());
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1.doubleValue())) * Math.cos(Math.toRadians(lat2.doubleValue())) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
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
