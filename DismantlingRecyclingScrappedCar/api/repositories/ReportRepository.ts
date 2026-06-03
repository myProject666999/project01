import { pool } from '../config/database';
import { MonthlyReport } from '../../shared/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface MonthlyStats {
  totalVehicles: number;
  totalWeight: number;
  reusableWeight: number;
  hazardousWeight: number;
  majorAssembliesCount: number;
}

export class ReportRepository {
  async findAll(): Promise<MonthlyReport[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM monthly_reports ORDER BY report_month DESC'
    );
    return rows.map(row => this.mapToMonthlyReport(row));
  }

  async findById(id: number): Promise<MonthlyReport | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM monthly_reports WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    return this.mapToMonthlyReport(rows[0]);
  }

  async findByMonth(month: string): Promise<MonthlyReport | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM monthly_reports WHERE report_month = ?',
      [month]
    );
    if (rows.length === 0) return null;
    return this.mapToMonthlyReport(rows[0]);
  }

  async create(report: Omit<MonthlyReport, 'id' | 'generatedAt'>): Promise<MonthlyReport> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO monthly_reports (report_month, total_vehicles, total_weight, reusable_weight, hazardous_weight, major_assemblies_count, generated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        report.reportMonth,
        report.totalVehicles,
        report.totalWeight,
        report.reusableWeight,
        report.hazardousWeight,
        report.majorAssembliesCount,
        report.generatedBy,
      ]
    );
    return this.findById(result.insertId) as Promise<MonthlyReport>;
  }

  async getMonthlyStats(month: string): Promise<MonthlyStats> {
    const [vehicleCountResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total_vehicles
       FROM vehicles
       WHERE DATE_FORMAT(created_at, '%Y-%m') = ?`,
      [month]
    );

    const [partsStatsResult] = await pool.execute<RowDataPacket[]>(
      `SELECT
         COALESCE(SUM(dp.weight), 0) as total_weight,
         COALESCE(SUM(CASE WHEN dp.is_reusable = 1 THEN dp.weight ELSE 0 END), 0) as reusable_weight,
         COALESCE(SUM(CASE WHEN dp.is_hazardous = 1 THEN dp.weight ELSE 0 END), 0) as hazardous_weight,
         COALESCE(SUM(CASE WHEN dp.is_major_assembly = 1 THEN 1 ELSE 0 END), 0) as major_assemblies_count
       FROM dismantling_parts dp
       INNER JOIN dismantling_tasks dt ON dp.task_id = dt.id
       INNER JOIN vehicles v ON dt.vehicle_id = v.id
       WHERE DATE_FORMAT(v.created_at, '%Y-%m') = ?`,
      [month]
    );

    const vehicleCount = vehicleCountResult[0];
    const partsStats = partsStatsResult[0];

    return {
      totalVehicles: vehicleCount.total_vehicles || 0,
      totalWeight: partsStats.total_weight || 0,
      reusableWeight: partsStats.reusable_weight || 0,
      hazardousWeight: partsStats.hazardous_weight || 0,
      majorAssembliesCount: partsStats.major_assemblies_count || 0,
    };
  }

  private mapToMonthlyReport(row: RowDataPacket): MonthlyReport {
    return {
      id: row.id,
      reportMonth: row.report_month,
      totalVehicles: row.total_vehicles,
      totalWeight: row.total_weight,
      reusableWeight: row.reusable_weight,
      hazardousWeight: row.hazardous_weight,
      majorAssembliesCount: row.major_assemblies_count,
      generatedBy: row.generated_by,
      generatedAt: row.generated_at,
    };
  }
}

export const reportRepository = new ReportRepository();
