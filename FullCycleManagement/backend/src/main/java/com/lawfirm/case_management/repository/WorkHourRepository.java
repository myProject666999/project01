package com.lawfirm.case_management.repository;

import com.lawfirm.case_management.entity.WorkHour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkHourRepository extends JpaRepository<WorkHour, Long> {

    List<WorkHour> findByCaseId(Long caseId);

    List<WorkHour> findByLawyerId(Long lawyerId);

    List<WorkHour> findByLawyerIdAndWorkDateBetween(Long lawyerId, LocalDate startDate, LocalDate endDate);

    List<WorkHour> findByCaseIdAndWorkDateBetween(Long caseId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT w FROM WorkHour w WHERE w.workDate BETWEEN :startDate AND :endDate")
    List<WorkHour> findByWorkDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(w.totalAmount), 0) FROM WorkHour w WHERE w.lawyerId = :lawyerId AND w.workDate BETWEEN :startDate AND :endDate")
    java.math.BigDecimal sumTotalAmountByLawyerIdAndDateRange(Long lawyerId, LocalDate startDate, LocalDate endDate);
}
