import { pool } from '../config/database';
import { dismantlingTaskRepository } from '../repositories/DismantlingTaskRepository';
import { dismantlingPartRepository } from '../repositories/DismantlingPartRepository';
import { vehicleRepository } from '../repositories/VehicleRepository';
import type { DismantlingTask, DismantlingPart } from '../../shared/types';

export class DismantlingService {
  async getAllTasks(status?: string): Promise<DismantlingTask[]> {
    if (status && !['pending', 'in_progress', 'completed'].includes(status)) {
      throw new Error('Invalid task status');
    }
    return dismantlingTaskRepository.findAll(status);
  }

  async getTaskById(id: number): Promise<DismantlingTask | null> {
    if (!id || id <= 0) {
      throw new Error('Invalid task ID');
    }
    return dismantlingTaskRepository.findById(id);
  }

  async createTask(vehicleId: number, operatorId: number): Promise<DismantlingTask> {
    if (!vehicleId || vehicleId <= 0) {
      throw new Error('Invalid vehicle ID');
    }
    if (!operatorId || operatorId <= 0) {
      throw new Error('Invalid operator ID');
    }

    const vehicle = await vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    if (vehicle.status === 'dismantling') {
      throw new Error('Vehicle is already being dismantled');
    }
    if (vehicle.status === 'completed') {
      throw new Error('Vehicle has already been dismantled');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const task = await dismantlingTaskRepository.create({
        vehicleId,
        status: 'pending',
        operatorId,
      });

      await vehicleRepository.update(vehicleId, { status: 'dismantling' });

      await connection.commit();
      return task;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async startTask(id: number): Promise<DismantlingTask | null> {
    if (!id || id <= 0) {
      throw new Error('Invalid task ID');
    }

    const task = await dismantlingTaskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.status !== 'pending') {
      throw new Error('Only pending tasks can be started');
    }

    const startDate = new Date().toISOString().split('T')[0];
    return dismantlingTaskRepository.update(id, {
      status: 'in_progress',
      startDate,
    });
  }

  async completeTask(id: number): Promise<DismantlingTask | null> {
    if (!id || id <= 0) {
      throw new Error('Invalid task ID');
    }

    const task = await dismantlingTaskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.status !== 'in_progress') {
      throw new Error('Only in-progress tasks can be completed');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const endDate = new Date().toISOString().split('T')[0];
      const updatedTask = await dismantlingTaskRepository.update(id, {
        status: 'completed',
        endDate,
      });

      await vehicleRepository.update(task.vehicleId, { status: 'completed' });

      await connection.commit();
      return updatedTask;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async addPart(taskId: number, partData: Omit<DismantlingPart, 'id' | 'createdAt' | 'updatedAt'>): Promise<DismantlingPart> {
    if (!taskId || taskId <= 0) {
      throw new Error('Invalid task ID');
    }
    if (!partData.name || partData.name.trim() === '') {
      throw new Error('Part name is required');
    }
    if (partData.weight === undefined || partData.weight <= 0) {
      throw new Error('Weight must be a positive number');
    }

    const task = await dismantlingTaskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.status === 'completed') {
      throw new Error('Cannot add parts to a completed task');
    }

    const part: Omit<DismantlingPart, 'id' | 'createdAt' | 'updatedAt'> = {
      ...partData,
      taskId,
      status: partData.status || 'pending',
      isReusable: partData.isReusable ?? false,
      isHazardous: partData.isHazardous ?? false,
      isMajorAssembly: partData.isMajorAssembly ?? false,
      majorAssemblyType: partData.majorAssemblyType || 'none',
    };

    return dismantlingPartRepository.create(part);
  }

  async updatePart(partId: number, data: Partial<DismantlingPart>): Promise<DismantlingPart | null> {
    if (!partId || partId <= 0) {
      throw new Error('Invalid part ID');
    }

    const part = await dismantlingPartRepository.findById(partId);
    if (!part) {
      throw new Error('Part not found');
    }

    if (data.status && !['pending', 'dismantled', 'stocked', 'disposed'].includes(data.status)) {
      throw new Error('Invalid part status');
    }

    if (data.status === 'dismantled') {
      return dismantlingPartRepository.update(partId, {
        ...data,
        dismantledAt: data.dismantledAt || new Date().toISOString(),
      });
    }

    return dismantlingPartRepository.update(partId, data);
  }

  async updatePartStatus(partId: number, status: DismantlingPart['status']): Promise<DismantlingPart | null> {
    if (!partId || partId <= 0) {
      throw new Error('Invalid part ID');
    }
    if (!['pending', 'dismantled', 'stocked', 'disposed'].includes(status)) {
      throw new Error('Invalid part status');
    }

    const part = await dismantlingPartRepository.findById(partId);
    if (!part) {
      throw new Error('Part not found');
    }

    if (status === 'dismantled') {
      const dismantledAt = new Date().toISOString();
      return dismantlingPartRepository.update(partId, { status, dismantledAt });
    }

    return dismantlingPartRepository.updateStatus(partId, status);
  }

  async getTaskParts(taskId: number): Promise<DismantlingPart[]> {
    if (!taskId || taskId <= 0) {
      throw new Error('Invalid task ID');
    }

    const task = await dismantlingTaskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    return dismantlingPartRepository.findAll(taskId);
  }
}

export const dismantlingService = new DismantlingService();
