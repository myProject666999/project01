import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { dismantlingService } from '../services/DismantlingService';
import type { ApiResponse, DismantlingTask, DismantlingPart } from '../../shared/types';

class DismantlingController {
  async getTasks(req: AuthRequest, res: Response<ApiResponse<DismantlingTask[]>>): Promise<void> {
    try {
      const { status } = req.query;
      const tasks = await dismantlingService.getAllTasks(status as string);
      res.json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '获取拆解任务列表失败',
      });
    }
  }

  async getTask(req: AuthRequest, res: Response<ApiResponse<DismantlingTask | null>>): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const task = await dismantlingService.getTaskById(id);

      if (!task) {
        res.status(404).json({
          success: false,
          error: '拆解任务不存在',
        });
        return;
      }

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '获取拆解任务失败',
      });
    }
  }

  async createTask(req: AuthRequest, res: Response<ApiResponse<DismantlingTask>>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: '未登录',
        });
        return;
      }

      const { vehicleId } = req.body;
      const task = await dismantlingService.createTask(vehicleId, req.user.id);
      res.status(201).json({
        success: true,
        data: task,
        message: '拆解任务创建成功',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '创建拆解任务失败',
      });
    }
  }

  async startTask(req: AuthRequest, res: Response<ApiResponse<DismantlingTask | null>>): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const task = await dismantlingService.startTask(id);

      if (!task) {
        res.status(404).json({
          success: false,
          error: '拆解任务不存在',
        });
        return;
      }

      res.json({
        success: true,
        data: task,
        message: '拆解任务已开始',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '开始拆解任务失败',
      });
    }
  }

  async completeTask(req: AuthRequest, res: Response<ApiResponse<DismantlingTask | null>>): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const task = await dismantlingService.completeTask(id);

      if (!task) {
        res.status(404).json({
          success: false,
          error: '拆解任务不存在',
        });
        return;
      }

      res.json({
        success: true,
        data: task,
        message: '拆解任务已完成',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '完成拆解任务失败',
      });
    }
  }

  async addPart(req: AuthRequest, res: Response<ApiResponse<DismantlingPart>>): Promise<void> {
    try {
      const taskId = parseInt(req.params.id, 10);
      const part = await dismantlingService.addPart(taskId, req.body);
      res.status(201).json({
        success: true,
        data: part,
        message: '零部件添加成功',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '添加零部件失败',
      });
    }
  }

  async updatePart(req: AuthRequest, res: Response<ApiResponse<DismantlingPart | null>>): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const part = await dismantlingService.updatePart(id, req.body);

      if (!part) {
        res.status(404).json({
          success: false,
          error: '零部件不存在',
        });
        return;
      }

      res.json({
        success: true,
        data: part,
        message: '零部件更新成功',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '更新零部件失败',
      });
    }
  }
}

export const dismantlingController = new DismantlingController();
