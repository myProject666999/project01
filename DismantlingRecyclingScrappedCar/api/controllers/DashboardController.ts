import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export class DashboardController {
  async getStats(req: AuthRequest, res: Response) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [todayVehicles] = await pool.execute<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM vehicles WHERE DATE(created_at) = ?",
        [today]
      );

      const [inProgressTasks] = await pool.execute<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM dismantling_tasks WHERE status = 'in_progress'"
      );

      const [pendingHazardous] = await pool.execute<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM hazardous_wastes WHERE status = 'pending'"
      );

      const [pendingWaybills] = await pool.execute<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM waybills WHERE signed_back = FALSE"
      );

      const [totalVehicles] = await pool.execute<RowDataPacket[]>(
        "SELECT COUNT(*) as count FROM vehicles"
      );

      const [totalWeight] = await pool.execute<RowDataPacket[]>(
        "SELECT COALESCE(SUM(weight), 0) as total FROM dismantling_parts"
      );

      const [monthlyData] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          DATE_FORMAT(v.created_at, '%Y-%m') as month,
          COUNT(DISTINCT v.id) as vehicle_count,
          COALESCE(SUM(p.weight), 0) as total_weight
         FROM vehicles v
         LEFT JOIN dismantling_tasks t ON v.id = t.vehicle_id
         LEFT JOIN dismantling_parts p ON t.id = p.task_id
         WHERE v.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
         GROUP BY DATE_FORMAT(v.created_at, '%Y-%m')
         ORDER BY month DESC
         LIMIT 6`
      );

      const [recentVehicles] = await pool.execute<RowDataPacket[]>(
        `SELECT v.*, 
          (SELECT status FROM dismantling_tasks t WHERE t.vehicle_id = v.id ORDER BY t.id DESC LIMIT 1) as task_status
         FROM vehicles v
         ORDER BY v.created_at DESC
         LIMIT 5`
      );

      res.json({
        success: true,
        data: {
          todayVehicles: todayVehicles[0]?.count || 0,
          inProgressTasks: inProgressTasks[0]?.count || 0,
          pendingHazardous: pendingHazardous[0]?.count || 0,
          pendingWaybills: pendingWaybills[0]?.count || 0,
          totalVehicles: totalVehicles[0]?.count || 0,
          totalWeight: totalWeight[0]?.total || 0,
          monthlyData: monthlyData.map(row => ({
            month: row.month,
            vehicleCount: row.vehicle_count,
            totalWeight: row.total_weight
          })),
          recentVehicles: recentVehicles.map(row => ({
            id: row.id,
            plateNumber: row.plate_number,
            vin: row.vin,
            owner: row.owner,
            status: row.task_status || row.status,
            createdAt: row.created_at
          }))
        }
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      res.status(500).json({ success: false, error: '获取统计数据失败' });
    }
  }
}

export const dashboardController = new DashboardController();
