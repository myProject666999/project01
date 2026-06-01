package com.ptod.repository;

import com.ptod.entity.TimeSlot;
import com.ptod.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    List<TimeSlot> findByTeacherIdAndSlotDateAndIsAvailableTrue(Long teacherId, LocalDate slotDate);

    List<TimeSlot> findByTeacherId(Long teacherId);

    List<TimeSlot> findByTeacherIdAndSlotDateAfterOrderBySlotDateAscStartTimeAsc(Long teacherId, LocalDate date);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TimeSlot t WHERE t.id = :id AND t.isAvailable = true")
    Optional<TimeSlot> findByIdAndLockForUpdate(@Param("id") Long id);

    boolean existsByTeacherAndSlotDateAndStartTimeAndEndTime(User teacher, LocalDate slotDate, java.time.LocalTime startTime, java.time.LocalTime endTime);
}
