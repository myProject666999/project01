package com.ptod.repository;

import com.ptod.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByTeacherIdOrderByAppointmentTimeDesc(Long teacherId);

    List<Appointment> findByParentIdOrderByAppointmentTimeDesc(Long parentId);

    List<Appointment> findByTeacherIdAndStatus(Long teacherId, Appointment.AppointmentStatus status);

    List<Appointment> findByParentIdAndStatus(Long parentId, Appointment.AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.timeSlot.id = :timeSlotId AND a.status IN ('PENDING', 'CONFIRMED')")
    Optional<Appointment> findActiveByTimeSlotId(@Param("timeSlotId") Long timeSlotId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Appointment a WHERE a.id = :id")
    Optional<Appointment> findByIdAndLockForUpdate(@Param("id") Long id);

    boolean existsByTimeSlotIdAndStatusIn(Long timeSlotId, List<Appointment.AppointmentStatus> statuses);
}
