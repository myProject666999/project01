package com.borderport.repository;

import com.borderport.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByAppointmentNo(String appointmentNo);

    List<Appointment> findByDriverPhone(String driverPhone);

    List<Appointment> findByPortIdAndAppointmentDate(Long portId, LocalDate date);
}
