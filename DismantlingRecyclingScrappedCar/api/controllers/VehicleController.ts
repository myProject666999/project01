import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { vehicleService } from '../services/VehicleService';
import type { ApiResponse, Vehicle } from '../../shared/types';

class VehicleController {
  async getVehicles(req: AuthRequest, res: Response<ApiResponse<Vehicle[]>>): Promise<void> {
    try {
      const { status } = req.query;
      const vehicles = await vehicleService.getAllVehicles(status as string);
      res.json({
        success: true,
        data: vehicles,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '获取车辆列表失败',
      });
    }
  }

  async getVehicle(req: AuthRequest, res: Response<ApiResponse<Vehicle | null>>): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const vehicle = await vehicleService.getVehicleById(id);

      if (!vehicle) {
        res.status(404).json({
          success: false,
          error: '车辆不存在',
        });
        return;
      }

      res.json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '获取车辆信息失败',
      });
    }
  }

  async createVehicle(req: AuthRequest, res: Response<ApiResponse<Vehicle>>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: '未登录',
        });
        return;
      }

      const vehicle = await vehicleService.createVehicle(req.body, req.user.id);
      res.status(201).json({
        success: true,
        data: vehicle,
        message: '车辆创建成功',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '创建车辆失败',
      });
    }
  }

  async updateVehicle(req: AuthRequest, res: Response<ApiResponse<Vehicle | null>>): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const vehicle = await vehicleService.updateVehicle(id, req.body);

      if (!vehicle) {
        res.status(404).json({
          success: false,
          error: '车辆不存在',
        });
        return;
      }

      res.json({
        success: true,
        data: vehicle,
        message: '车辆更新成功',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '更新车辆失败',
      });
    }
  }

  async deleteVehicle(req: AuthRequest, res: Response<ApiResponse<boolean>>): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await vehicleService.deleteVehicle(id);

      res.json({
        success: true,
        data: deleted,
        message: '车辆删除成功',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '删除车辆失败',
      });
    }
  }

  async searchVehicles(req: AuthRequest, res: Response<ApiResponse<Vehicle[]>>): Promise<void> {
    try {
      const { keyword } = req.query;
      const vehicles = await vehicleService.searchVehicles(keyword as string);
      res.json({
        success: true,
        data: vehicles,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '搜索车辆失败',
      });
    }
  }
}

export const vehicleController = new VehicleController();
