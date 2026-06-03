import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { hazardousService } from '../services/HazardousService';
import type { ApiResponse, HazardousWaste, Waybill } from '../../shared/types';

class HazardousController {
  async getWastes(req: AuthRequest, res: Response<ApiResponse<HazardousWaste[]>>): Promise<void> {
    try {
      const { status, type } = req.query;
      const wastes = await hazardousService.getAllWastes(status as string, type as string);
      res.json({
        success: true,
        data: wastes,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '获取危废列表失败',
      });
    }
  }

  async getPendingWastes(req: AuthRequest, res: Response<ApiResponse<HazardousWaste[]>>): Promise<void> {
    try {
      const wastes = await hazardousService.getPendingWastes();
      res.json({
        success: true,
        data: wastes,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '获取待处理危废列表失败',
      });
    }
  }

  async getWaste(req: AuthRequest, res: Response<ApiResponse<HazardousWaste | null>>): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const waste = await hazardousService.getWasteById(id);

      if (!waste) {
        res.status(404).json({
          success: false,
          error: '危废记录不存在',
        });
        return;
      }

      res.json({
        success: true,
        data: waste,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '获取危废信息失败',
      });
    }
  }

  async createWaste(req: AuthRequest, res: Response<ApiResponse<HazardousWaste>>): Promise<void> {
    try {
      const waste = await hazardousService.createWaste(req.body);
      res.status(201).json({
        success: true,
        data: waste,
        message: '危废记录创建成功',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '创建危废记录失败',
      });
    }
  }

  async getWaybills(req: AuthRequest, res: Response<ApiResponse<Waybill[]>>): Promise<void> {
    try {
      const { status } = req.query;
      const waybills = await hazardousService.getAllWaybills(status as string);
      res.json({
        success: true,
        data: waybills,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '获取运单列表失败',
      });
    }
  }

  async getWaybill(req: AuthRequest, res: Response<ApiResponse<Waybill | null>>): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const waybill = await hazardousService.getWaybillById(id);

      if (!waybill) {
        res.status(404).json({
          success: false,
          error: '运单不存在',
        });
        return;
      }

      res.json({
        success: true,
        data: waybill,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '获取运单信息失败',
      });
    }
  }

  async createWaybill(req: AuthRequest, res: Response<ApiResponse<Waybill>>): Promise<void> {
    try {
      const { wasteIds, ...waybillData } = req.body;
      const waybill = await hazardousService.createWaybill(waybillData, wasteIds);
      res.status(201).json({
        success: true,
        data: waybill,
        message: '运单创建成功',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '创建运单失败',
      });
    }
  }

  async signBackWaybill(req: AuthRequest, res: Response<ApiResponse<Waybill | null>>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: '未登录',
        });
        return;
      }

      const id = parseInt(req.params.id, 10);
      const waybill = await hazardousService.signBackWaybill(id, req.user.id);

      if (!waybill) {
        res.status(404).json({
          success: false,
          error: '运单不存在',
        });
        return;
      }

      res.json({
        success: true,
        data: waybill,
        message: '运单签收成功',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '运单签收失败',
      });
    }
  }
}

export const hazardousController = new HazardousController();
