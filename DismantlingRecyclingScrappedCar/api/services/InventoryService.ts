import { pool } from '../config/database';
import { inventoryRepository } from '../repositories/InventoryRepository';
import { dismantlingPartRepository } from '../repositories/DismantlingPartRepository';
import type { InventoryItem } from '../../shared/types';

export class InventoryService {
  async getAllItems(status?: string): Promise<InventoryItem[]> {
    if (status && !['in_stock', 'sold'].includes(status)) {
      throw new Error('Invalid inventory status');
    }
    return inventoryRepository.findAll(status);
  }

  async getItemById(id: number): Promise<InventoryItem | null> {
    if (!id || id <= 0) {
      throw new Error('Invalid item ID');
    }
    return inventoryRepository.findById(id);
  }

  async stockIn(partId: number, location: string): Promise<InventoryItem> {
    if (!partId || partId <= 0) {
      throw new Error('Invalid part ID');
    }
    if (!location || location.trim() === '') {
      throw new Error('Location is required');
    }

    const part = await dismantlingPartRepository.findById(partId);
    if (!part) {
      throw new Error('Part not found');
    }

    if (part.status === 'stocked') {
      throw new Error('Part is already in stock');
    }

    const existingItems = await inventoryRepository.findByPartId(partId);
    const existingInStock = existingItems.find(item => item.status === 'in_stock');
    if (existingInStock) {
      throw new Error('Part is already in stock');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const inDate = new Date().toISOString().split('T')[0];
      const inventoryItem = await inventoryRepository.create({
        partId,
        partName: part.name,
        quantity: 1,
        weight: part.weight,
        location: location.trim(),
        inDate,
        status: 'in_stock',
      });

      await dismantlingPartRepository.updateStatus(partId, 'stocked');

      await connection.commit();
      return inventoryItem;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async stockOut(id: number, price: number, buyer: string): Promise<InventoryItem | null> {
    if (!id || id <= 0) {
      throw new Error('Invalid item ID');
    }
    if (price === undefined || price <= 0) {
      throw new Error('Price must be a positive number');
    }
    if (!buyer || buyer.trim() === '') {
      throw new Error('Buyer is required');
    }

    const item = await inventoryRepository.findById(id);
    if (!item) {
      throw new Error('Inventory item not found');
    }

    if (item.status === 'sold') {
      throw new Error('Item has already been sold');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const outDate = new Date().toISOString().split('T')[0];
      const updatedItem = await inventoryRepository.markAsSold(id, {
        outDate,
        price,
        buyer: buyer.trim(),
      });

      await dismantlingPartRepository.updateStatus(item.partId, 'disposed');

      await connection.commit();
      return updatedItem;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export const inventoryService = new InventoryService();
