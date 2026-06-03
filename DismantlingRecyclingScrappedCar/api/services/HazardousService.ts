import { pool } from '../config/database';
import { hazardousWasteRepository } from '../repositories/HazardousWasteRepository';
import { waybillRepository } from '../repositories/WaybillRepository';
import type { HazardousWaste, Waybill, HazardousWasteType } from '../../shared/types';

export class HazardousService {
  async getAllWastes(status?: string, type?: string): Promise<HazardousWaste[]> {
    if (status && !['pending', 'transferred', 'completed'].includes(status)) {
      throw new Error('Invalid waste status');
    }
    if (type && !['oil', 'antifreeze', 'battery', 'other'].includes(type)) {
      throw new Error('Invalid waste type');
    }
    return hazardousWasteRepository.findAll(status, type);
  }

  async getWasteById(id: number): Promise<HazardousWaste | null> {
    if (!id || id <= 0) {
      throw new Error('Invalid waste ID');
    }
    return hazardousWasteRepository.findById(id);
  }

  async createWaste(data: Omit<HazardousWaste, 'id' | 'createdAt' | 'updatedAt'>): Promise<HazardousWaste> {
    if (!data.type || !['oil', 'antifreeze', 'battery', 'other'].includes(data.type)) {
      throw new Error('Valid waste type is required');
    }
    if (!data.name || data.name.trim() === '') {
      throw new Error('Waste name is required');
    }
    if (data.weight === undefined || data.weight <= 0) {
      throw new Error('Weight must be a positive number');
    }
    if (!data.vehicleId || data.vehicleId <= 0) {
      throw new Error('Valid vehicle ID is required');
    }

    const wasteData = {
      ...data,
      status: data.status || 'pending',
      type: data.type as HazardousWasteType,
    };

    return hazardousWasteRepository.create(wasteData);
  }

  async getPendingWastes(): Promise<HazardousWaste[]> {
    return hazardousWasteRepository.findPending();
  }

  async createWaybill(data: Omit<Waybill, 'id' | 'waybillNo' | 'signedBack' | 'createdAt' | 'updatedAt' | 'wastes'>, wasteIds: number[]): Promise<Waybill> {
    if (!data.disposalFactory || data.disposalFactory.trim() === '') {
      throw new Error('Disposal factory is required');
    }
    if (!data.transferDate || data.transferDate.trim() === '') {
      throw new Error('Transfer date is required');
    }
    if (data.totalWeight === undefined || data.totalWeight <= 0) {
      throw new Error('Total weight must be a positive number');
    }
    if (!wasteIds || wasteIds.length === 0) {
      throw new Error('At least one waste ID is required');
    }

    for (const wasteId of wasteIds) {
      const waste = await hazardousWasteRepository.findById(wasteId);
      if (!waste) {
        throw new Error(`Waste with ID ${wasteId} not found`);
      }
      if (waste.status !== 'pending') {
        throw new Error(`Waste with ID ${wasteId} is not in pending status`);
      }
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const waybillData = {
        ...data,
        status: data.status || 'transferred',
      };

      const waybill = await waybillRepository.create(waybillData);

      for (const wasteId of wasteIds) {
        await waybillRepository.addWaste(waybill.id, wasteId);
        await hazardousWasteRepository.assignWaybill(wasteId, waybill.id);
        await hazardousWasteRepository.updateStatus(wasteId, 'transferred');
      }

      const waybillWithWastes = await waybillRepository.findById(waybill.id);
      if (waybillWithWastes) {
        waybillWithWastes.wastes = await waybillRepository.getWastes(waybill.id);
      }

      await connection.commit();
      return waybillWithWastes as Waybill;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getAllWaybills(status?: string): Promise<Waybill[]> {
    if (status && !['pending', 'transferred', 'completed'].includes(status)) {
      throw new Error('Invalid waybill status');
    }
    return waybillRepository.findAll(status);
  }

  async getWaybillById(id: number): Promise<Waybill | null> {
    if (!id || id <= 0) {
      throw new Error('Invalid waybill ID');
    }
    const waybill = await waybillRepository.findById(id);
    if (waybill) {
      waybill.wastes = await waybillRepository.getWastes(id);
    }
    return waybill;
  }

  async signBackWaybill(id: number, userId: number): Promise<Waybill | null> {
    if (!id || id <= 0) {
      throw new Error('Invalid waybill ID');
    }
    if (!userId || userId <= 0) {
      throw new Error('Invalid user ID');
    }

    const waybill = await waybillRepository.findById(id);
    if (!waybill) {
      throw new Error('Waybill not found');
    }

    if (waybill.signedBack) {
      throw new Error('Waybill has already been signed back');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const updatedWaybill = await waybillRepository.signBack(id, userId);

      const wastes = await waybillRepository.getWastes(id);
      for (const waste of wastes) {
        await hazardousWasteRepository.updateStatus(waste.id, 'completed');
      }

      if (updatedWaybill) {
        updatedWaybill.wastes = wastes;
      }

      await connection.commit();
      return updatedWaybill;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export const hazardousService = new HazardousService();
