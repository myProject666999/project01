package com.lawfirm.case_management.service;

import com.lawfirm.case_management.entity.Lawyer;
import com.lawfirm.case_management.entity.WorkHour;
import com.lawfirm.case_management.repository.LawyerRepository;
import com.lawfirm.case_management.repository.WorkHourRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

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

    public byte[] exportMonthlyBillToExcel(Long lawyerId, Integer year, Integer month) throws Exception {
        MonthlyBill bill = generateMonthlyBill(lawyerId, year, month);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("工时账单");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle moneyStyle = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            moneyStyle.setDataFormat(format.getFormat("#,##0.00"));

            int rowNum = 0;

            Row titleRow = sheet.createRow(rowNum++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(bill.getLawyerName() + " - " + year + "年" + month + "月工时账单");
            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 5));

            rowNum++;

            Row summaryLabelRow = sheet.createRow(rowNum++);
            summaryLabelRow.createCell(0).setCellValue("汇总统计");

            Row summaryRow1 = sheet.createRow(rowNum++);
            summaryRow1.createCell(0).setCellValue("总时长(分钟):");
            summaryRow1.createCell(1).setCellValue(bill.getTotalMinutes() != null ? bill.getTotalMinutes() : 0);
            summaryRow1.createCell(2).setCellValue("计费单元:");
            summaryRow1.createCell(3).setCellValue(bill.getTotalBillingUnits() != null ? bill.getTotalBillingUnits() : 0);

            Row summaryRow2 = sheet.createRow(rowNum++);
            summaryRow2.createCell(0).setCellValue("总金额(元):");
            Cell amountCell = summaryRow2.createCell(1);
            amountCell.setCellValue(bill.getTotalAmount() != null ? bill.getTotalAmount().doubleValue() : 0);
            amountCell.setCellStyle(moneyStyle);

            rowNum++;

            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = {"工作日期", "工作类型", "工作内容", "时长(分钟)", "计费单元", "金额(元)"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            if (bill.getWorkHours() != null) {
                for (WorkHour workHour : bill.getWorkHours()) {
                    Row dataRow = sheet.createRow(rowNum++);
                    dataRow.createCell(0).setCellValue(workHour.getWorkDate() != null ? workHour.getWorkDate().format(dateFormatter) : "");
                    dataRow.createCell(1).setCellValue(workHour.getWorkType() != null ? workHour.getWorkType() : "");
                    dataRow.createCell(2).setCellValue(workHour.getWorkContent() != null ? workHour.getWorkContent() : "");
                    dataRow.createCell(3).setCellValue(workHour.getWorkMinutes() != null ? workHour.getWorkMinutes() : 0);
                    dataRow.createCell(4).setCellValue(workHour.getBillingUnits() != null ? workHour.getBillingUnits() : 0);
                    Cell moneyCell = dataRow.createCell(5);
                    moneyCell.setCellValue(workHour.getTotalAmount() != null ? workHour.getTotalAmount().doubleValue() : 0);
                    moneyCell.setCellStyle(moneyStyle);
                }
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            sheet.setColumnWidth(2, 15000);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        }
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
