package com.lawfirm.case_management.service;

import com.lawfirm.case_management.entity.Lawyer;
import com.lawfirm.case_management.entity.WorkHour;
import com.lawfirm.case_management.repository.LawyerRepository;
import com.lawfirm.case_management.repository.WorkHourRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkHourService {

    private final WorkHourRepository workHourRepository;
    private final LawyerRepository lawyerRepository;

    public List<WorkHour> findAll() {
        return workHourRepository.findAll();
    }

    public List<WorkHour> findByCaseId(Long caseId) {
        return workHourRepository.findByCaseId(caseId);
    }

    public List<WorkHour> findByLawyerId(Long lawyerId) {
        return workHourRepository.findByLawyerId(lawyerId);
    }

    public List<WorkHour> findByDateRange(LocalDate startDate, LocalDate endDate) {
        return workHourRepository.findByWorkDateBetween(startDate, endDate);
    }

    @Transactional
    public WorkHour createWorkHour(WorkHour workHour) {
        Lawyer lawyer = lawyerRepository.findById(workHour.getLawyerId())
            .orElseThrow(() -> new IllegalArgumentException("律师不存在"));

        if (workHour.getHourlyRate() == null) {
            workHour.setHourlyRate(lawyer.getHourlyRate());
        }

        workHour.calculateBilling();

        return workHourRepository.save(workHour);
    }

    @Transactional
    public WorkHour updateWorkHour(Long id, WorkHour workHour) {
        WorkHour existing = workHourRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("工时记录不存在"));

        existing.setWorkDate(workHour.getWorkDate());
        existing.setWorkMinutes(workHour.getWorkMinutes());
        existing.setWorkContent(workHour.getWorkContent());
        existing.setWorkType(workHour.getWorkType());
        existing.setHourlyRate(workHour.getHourlyRate());

        existing.calculateBilling();

        return workHourRepository.save(existing);
    }

    @Transactional
    public void deleteWorkHour(Long id) {
        workHourRepository.deleteById(id);
    }

    public MonthlyBill generateMonthlyBill(Long lawyerId, Integer year, Integer month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<WorkHour> workHours = workHourRepository.findByLawyerIdAndWorkDateBetween(lawyerId, startDate, endDate);
        Lawyer lawyer = lawyerRepository.findById(lawyerId).orElse(null);

        MonthlyBill bill = new MonthlyBill();
        bill.setLawyerId(lawyerId);
        bill.setLawyerName(lawyer != null ? lawyer.getName() : "");
        bill.setYear(year);
        bill.setMonth(month);
        bill.setWorkHours(workHours);

        int totalMinutes = workHours.stream().mapToInt(WorkHour::getWorkMinutes).sum();
        int totalUnits = workHours.stream().mapToInt(WorkHour::getBillingUnits).sum();
        BigDecimal totalAmount = workHours.stream()
            .map(wh -> wh.getTotalAmount() != null ? wh.getTotalAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        bill.setTotalMinutes(totalMinutes);
        bill.setTotalBillingUnits(totalUnits);
        bill.setTotalAmount(totalAmount);

        return bill;
    }

    public Map<Long, MonthlyBill> generateAllLawyersMonthlyBill(Integer year, Integer month) {
        List<Lawyer> lawyers = lawyerRepository.findByStatus(1);
        Map<Long, MonthlyBill> bills = new HashMap<>();

        for (Lawyer lawyer : lawyers) {
            bills.put(lawyer.getId(), generateMonthlyBill(lawyer.getId(), year, month));
        }

        return bills;
    }

    public static class MonthlyBill {
        private Long lawyerId;
        private String lawyerName;
        private Integer year;
        private Integer month;
        private List<WorkHour> workHours;
        private Integer totalMinutes;
        private Integer totalBillingUnits;
        private BigDecimal totalAmount;

        public Long getLawyerId() { return lawyerId; }
        public void setLawyerId(Long lawyerId) { this.lawyerId = lawyerId; }
        public String getLawyerName() { return lawyerName; }
        public void setLawyerName(String lawyerName) { this.lawyerName = lawyerName; }
        public Integer getYear() { return year; }
        public void setYear(Integer year) { this.year = year; }
        public Integer getMonth() { return month; }
        public void setMonth(Integer month) { this.month = month; }
        public List<WorkHour> getWorkHours() { return workHours; }
        public void setWorkHours(List<WorkHour> workHours) { this.workHours = workHours; }
        public Integer getTotalMinutes() { return totalMinutes; }
        public void setTotalMinutes(Integer totalMinutes) { this.totalMinutes = totalMinutes; }
        public Integer getTotalBillingUnits() { return totalBillingUnits; }
        public void setTotalBillingUnits(Integer totalBillingUnits) { this.totalBillingUnits = totalBillingUnits; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    }
}
