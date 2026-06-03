import { vehicleRepository } from '../repositories/VehicleRepository';
import type { Vehicle } from '../../shared/types';

export class VehicleService {
  async getAllVehicles(status?: string): Promise<Vehicle[]> {
    if (status && !['registered', 'dismantling', 'completed'].includes(status)) {
      throw new Error('Invalid vehicle status');
    }
    return vehicleRepository.findAll(status);
  }

  async getVehicleById(id: number): Promise<Vehicle | null> {
    if (!id || id <= 0) {
      throw new Error('Invalid vehicle ID');
    }
    return vehicleRepository.findById(id);
  }

  async createVehicle(data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>, userId: number): Promise<Vehicle> {
    if (!data.plateNumber || data.plateNumber.trim() === '') {
      throw new Error('Plate number is required');
    }
    if (!data.vin || data.vin.trim() === '') {
      throw new Error('VIN is required');
    }
    if (!data.owner || data.owner.trim() === '') {
      throw new Error('Owner is required');
    }

    const existingVehicle = await vehicleRepository.findByVin(data.vin);
    if (existingVehicle) {
      throw new Error('Vehicle with this VIN already exists');
    }

    const vehicleData = {
      ...data,
      status: data.status || 'registered',
      createdBy: userId,
    };

    return vehicleRepository.create(vehicleData);
  }

  async updateVehicle(id: number, data: Partial<Vehicle>): Promise<Vehicle | null> {
    if (!id || id <= 0) {
      throw new Error('Invalid vehicle ID');
    }

    const existingVehicle = await vehicleRepository.findById(id);
    if (!existingVehicle) {
      throw new Error('Vehicle not found');
    }

    if (data.status && !['registered', 'dismantling', 'completed'].includes(data.status)) {
      throw new Error('Invalid vehicle status');
    }

    if (data.vin && data.vin !== existingVehicle.vin) {
      const duplicateVin = await vehicleRepository.findByVin(data.vin);
      if (duplicateVin) {
        throw new Error('Vehicle with this VIN already exists');
      }
    }

    return vehicleRepository.update(id, data);
  }

  async deleteVehicle(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('Invalid vehicle ID');
    }

    const existingVehicle = await vehicleRepository.findById(id);
    if (!existingVehicle) {
      throw new Error('Vehicle not found');
    }

    return vehicleRepository.delete(id);
  }

  async searchVehicles(keyword: string): Promise<Vehicle[]> {
    if (!keyword || keyword.trim() === '') {
      return vehicleRepository.findAll();
    }
    return vehicleRepository.search(keyword.trim());
  }
}

export const vehicleService = new VehicleService();
