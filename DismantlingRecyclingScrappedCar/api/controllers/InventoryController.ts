import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { inventoryService } from '../services/InventoryService';
import type { ApiResponse, InventoryItem } from '../../shared/types';

class InventoryController {
  async getItems(req: AuthRequest, res: Response<ApiResponse<InventoryItem[]>>): Promise<void> {
    try {
      const { status } = req.query;
      const items = await inventoryService.getAllItems(status as string);
      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '获取库存列表失败',
      });
    }
  }

  async getItem(req: AuthRequest, res: Response<ApiResponse<InventoryItem | null>>): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const item = await inventoryService.getItemById(id);

      if (!item) {
        res.status(404).json({
          success: false,
          error: '库存物品不存在',
        });
        return;
      }

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '获取库存物品失败',
      });
    }
  }

  async stockIn(req: AuthRequest, res: Response<ApiResponse<InventoryItem>>): Promise<void> {
    try {
      const { partId, location } = req.body;
      const item = await inventoryService.stockIn(partId, location);
      res.status(201).json({
        success: true,
        data: item,
        message: '入库成功',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '入库失败',
      });
    }
  }

  async stockOut(req: AuthRequest, res: Response<ApiResponse<InventoryItem | null>>): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { price, buyer } = req.body;
      const item = await inventoryService.stockOut(id, price, buyer);

      if (!item) {
        res.status(404).json({
          success: false,
          error: '库存物品不存在',
        });
        return;
      }

      res.json({
        success: true,
        data: item,
        message: '出库成功',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '出库失败',
      });
    }
  }
}

export const inventoryController = new InventoryController();
