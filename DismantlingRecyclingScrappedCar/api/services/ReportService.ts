import { reportRepository } from '../repositories/ReportRepository';
import type { MonthlyReport } from '../../shared/types';

export class ReportService {
  async getAllReports(): Promise<MonthlyReport[]> {
    return reportRepository.findAll();
  }

  async getReportById(id: number): Promise<MonthlyReport | null> {
    if (!id || id <= 0) {
      throw new Error('Invalid report ID');
    }
    return reportRepository.findById(id);
  }

  async generateMonthlyReport(month: string, userId: number): Promise<MonthlyReport> {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new Error('Invalid month format, expected YYYY-MM');
    }
    if (!userId || userId <= 0) {
      throw new Error('Invalid user ID');
    }

    const existingReport = await reportRepository.findByMonth(month);
    if (existingReport) {
      throw new Error(`Report for ${month} already exists`);
    }

    const stats = await reportRepository.getMonthlyStats(month);

    if (stats.totalVehicles === 0 && stats.totalWeight === 0) {
      throw new Error(`No data available for month ${month}`);
    }

    const reportData = {
      reportMonth: month,
      totalVehicles: stats.totalVehicles,
      totalWeight: stats.totalWeight,
      reusableWeight: stats.reusableWeight,
      hazardousWeight: stats.hazardousWeight,
      majorAssembliesCount: stats.majorAssembliesCount,
      generatedBy: userId,
    };

    return reportRepository.create(reportData);
  }

  async exportReport(id: number): Promise<MonthlyReport & { exportedAt: string }> {
    if (!id || id <= 0) {
      throw new Error('Invalid report ID');
    }

    const report = await reportRepository.findById(id);
    if (!report) {
      throw new Error('Report not found');
    }

    return {
      ...report,
      exportedAt: new Date().toISOString(),
    };
  }
}

export const reportService = new ReportService();
