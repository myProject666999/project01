import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { reportService } from '../services/ReportService';
import type { ApiResponse, MonthlyReport } from '../../shared/types';

class ReportController {
  async getReports(req: AuthRequest, res: Response<ApiResponse<MonthlyReport[]>>): Promise<void> {
    try {
      const reports = await reportService.getAllReports();
      res.json({
        success: true,
        data: reports,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '获取报表列表失败',
      });
    }
  }

  async getReport(req: AuthRequest, res: Response<ApiResponse<MonthlyReport | null>>): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const report = await reportService.getReportById(id);

      if (!report) {
        res.status(404).json({
          success: false,
          error: '报表不存在',
        });
        return;
      }

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '获取报表失败',
      });
    }
  }

  async generateReport(req: AuthRequest, res: Response<ApiResponse<MonthlyReport>>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: '未登录',
        });
        return;
      }

      const { month } = req.body;
      const report = await reportService.generateMonthlyReport(month, req.user.id);
      res.status(201).json({
        success: true,
        data: report,
        message: '报表生成成功',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '生成报表失败',
      });
    }
  }

  async exportReport(req: AuthRequest, res: Response<ApiResponse<MonthlyReport & { exportedAt: string }>>): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const report = await reportService.exportReport(id);

      res.json({
        success: true,
        data: report,
        message: '报表导出成功',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '导出报表失败',
      });
    }
  }
}

export const reportController = new ReportController();
