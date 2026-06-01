package com.ptod.repository;

import com.ptod.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    Optional<Rating> findByAppointmentId(Long appointmentId);

    List<Rating> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);

    @Query("SELECT AVG(r.score) FROM Rating r WHERE r.teacher.id = :teacherId")
    Double findAverageScoreByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.teacher.id = :teacherId")
    Long countByTeacherId(@Param("teacherId") Long teacherId);
}
