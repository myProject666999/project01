import { pool } from '../config/database';
import { Vehicle } from '../../shared/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class VehicleRepository {
  async findAll(status?: string): Promise<Vehicle[]> {
    let sql = 'SELECT * FROM vehicles';
    const params: any[] = [];
    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return rows.map(row => this.mapToVehicle(row));
  }

  async findById(id: number): Promise<Vehicle | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM vehicles WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    return this.mapToVehicle(rows[0]);
  }

  async findByVin(vin: string): Promise<Vehicle | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM vehicles WHERE vin = ?',
      [vin]
    );
    if (rows.length === 0) return null;
    return this.mapToVehicle(rows[0]);
  }

  async create(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO vehicles (plate_number, vin, owner, owner_phone, scrap_reason, transfer_date, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehicle.plateNumber,
        vehicle.vin,
        vehicle.owner,
        vehicle.ownerPhone ?? null,
        vehicle.scrapReason ?? null,
        vehicle.transferDate ?? null,
        vehicle.status ?? 'registered',
        vehicle.createdBy ?? null,
      ]
    );
    return this.findById(result.insertId) as Promise<Vehicle>;
  }

  async update(id: number, vehicle: Partial<Vehicle>): Promise<Vehicle | null> {
    const fields: string[] = [];
    const params: any[] = [];

    if (vehicle.plateNumber !== undefined) { fields.push('plate_number = ?'); params.push(vehicle.plateNumber); }
    if (vehicle.vin !== undefined) { fields.push('vin = ?'); params.push(vehicle.vin); }
    if (vehicle.owner !== undefined) { fields.push('owner = ?'); params.push(vehicle.owner); }
    if (vehicle.ownerPhone !== undefined) { fields.push('owner_phone = ?'); params.push(vehicle.ownerPhone); }
    if (vehicle.scrapReason !== undefined) { fields.push('scrap_reason = ?'); params.push(vehicle.scrapReason); }
    if (vehicle.transferDate !== undefined) { fields.push('transfer_date = ?'); params.push(vehicle.transferDate); }
    if (vehicle.status !== undefined) { fields.push('status = ?'); params.push(vehicle.status); }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    await pool.execute(`UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM vehicles WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  async search(keyword: string): Promise<Vehicle[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM vehicles WHERE plate_number LIKE ? OR vin LIKE ? OR owner LIKE ?
       ORDER BY created_at DESC`,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );
    return rows.map(row => this.mapToVehicle(row));
  }

  private mapToVehicle(row: RowDataPacket): Vehicle {
    return {
      id: row.id,
      plateNumber: row.plate_number,
      vin: row.vin,
      owner: row.owner,
      ownerPhone: row.owner_phone,
      scrapReason: row.scrap_reason,
      transferDate: row.transfer_date ? row.transfer_date.toISOString().split('T')[0] : undefined,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const vehicleRepository = new VehicleRepository();
