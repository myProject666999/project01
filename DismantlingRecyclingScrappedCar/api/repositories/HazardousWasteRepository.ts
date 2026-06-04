import { pool } from '../config/database';
import { HazardousWaste } from '../../shared/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class HazardousWasteRepository {
  async findAll(status?: string, type?: string): Promise<HazardousWaste[]> {
    let sql = 'SELECT * FROM hazardous_wastes';
    const params: any[] = [];
    const conditions: string[] = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return rows.map(row => this.mapToHazardousWaste(row));
  }

  async findById(id: number): Promise<HazardousWaste | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM hazardous_wastes WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    return this.mapToHazardousWaste(rows[0]);
  }

  async findByVehicleId(vehicleId: number): Promise<HazardousWaste[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM hazardous_wastes WHERE vehicle_id = ? ORDER BY created_at DESC',
      [vehicleId]
    );
    return rows.map(row => this.mapToHazardousWaste(row));
  }

  async findPending(): Promise<HazardousWaste[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM hazardous_wastes WHERE status = 'pending' ORDER BY created_at DESC"
    );
    return rows.map(row => this.mapToHazardousWaste(row));
  }

  async create(waste: Omit<HazardousWaste, 'id' | 'createdAt' | 'updatedAt'>): Promise<HazardousWaste> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO hazardous_wastes (part_id, type, name, weight, vehicle_id, waybill_id, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        waste.partId ?? null,
        waste.type,
        waste.name,
        waste.weight,
        waste.vehicleId,
        waste.waybillId ?? null,
        waste.status ?? 'pending',
        waste.notes ?? null,
      ]
    );
    return this.findById(result.insertId) as Promise<HazardousWaste>;
  }

  async update(id: number, waste: Partial<HazardousWaste>): Promise<HazardousWaste | null> {
    const fields: string[] = [];
    const params: any[] = [];

    if (waste.partId !== undefined) { fields.push('part_id = ?'); params.push(waste.partId); }
    if (waste.type !== undefined) { fields.push('type = ?'); params.push(waste.type); }
    if (waste.name !== undefined) { fields.push('name = ?'); params.push(waste.name); }
    if (waste.weight !== undefined) { fields.push('weight = ?'); params.push(waste.weight); }
    if (waste.vehicleId !== undefined) { fields.push('vehicle_id = ?'); params.push(waste.vehicleId); }
    if (waste.waybillId !== undefined) { fields.push('waybill_id = ?'); params.push(waste.waybillId); }
    if (waste.status !== undefined) { fields.push('status = ?'); params.push(waste.status); }
    if (waste.notes !== undefined) { fields.push('notes = ?'); params.push(waste.notes); }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    await pool.execute(`UPDATE hazardous_wastes SET ${fields.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  }

  async updateStatus(id: number, status: string): Promise<HazardousWaste | null> {
    await pool.execute(
      'UPDATE hazardous_wastes SET status = ? WHERE id = ?',
      [status, id]
    );
    return this.findById(id);
  }

  async assignWaybill(id: number, waybillId: number): Promise<HazardousWaste | null> {
    await pool.execute(
      'UPDATE hazardous_wastes SET waybill_id = ? WHERE id = ?',
      [waybillId, id]
    );
    return this.findById(id);
  }

  private mapToHazardousWaste(row: RowDataPacket): HazardousWaste {
    return {
      id: row.id,
      partId: row.part_id,
      type: row.type,
      name: row.name,
      weight: row.weight,
      vehicleId: row.vehicle_id,
      waybillId: row.waybill_id,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const hazardousWasteRepository = new HazardousWasteRepository();
