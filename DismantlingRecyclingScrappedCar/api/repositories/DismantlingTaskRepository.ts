import { pool } from '../config/database';
import { DismantlingTask, Vehicle } from '../../shared/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class DismantlingTaskRepository {
  async findAll(status?: string): Promise<DismantlingTask[]> {
    let sql = `SELECT dt.*, 
      v.id as v_id, v.plate_number as v_plate_number, v.vin as v_vin, v.owner as v_owner, 
      v.owner_phone as v_owner_phone, v.scrap_reason as v_scrap_reason, v.transfer_date as v_transfer_date,
      v.status as v_status, v.created_by as v_created_by, v.created_at as v_created_at, v.updated_at as v_updated_at
      FROM dismantling_tasks dt
      LEFT JOIN vehicles v ON dt.vehicle_id = v.id`;
    const params: any[] = [];
    if (status) {
      sql += ' WHERE dt.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY dt.created_at DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return rows.map(row => this.mapToDismantlingTask(row));
  }

  async findById(id: number): Promise<DismantlingTask | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT dt.*, 
        v.id as v_id, v.plate_number as v_plate_number, v.vin as v_vin, v.owner as v_owner, 
        v.owner_phone as v_owner_phone, v.scrap_reason as v_scrap_reason, v.transfer_date as v_transfer_date,
        v.status as v_status, v.created_by as v_created_by, v.created_at as v_created_at, v.updated_at as v_updated_at
        FROM dismantling_tasks dt
        LEFT JOIN vehicles v ON dt.vehicle_id = v.id
        WHERE dt.id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    return this.mapToDismantlingTask(rows[0]);
  }

  async findByVehicleId(vehicleId: number): Promise<DismantlingTask[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT dt.*, 
        v.id as v_id, v.plate_number as v_plate_number, v.vin as v_vin, v.owner as v_owner, 
        v.owner_phone as v_owner_phone, v.scrap_reason as v_scrap_reason, v.transfer_date as v_transfer_date,
        v.status as v_status, v.created_by as v_created_by, v.created_at as v_created_at, v.updated_at as v_updated_at
        FROM dismantling_tasks dt
        LEFT JOIN vehicles v ON dt.vehicle_id = v.id
        WHERE dt.vehicle_id = ?
        ORDER BY dt.created_at DESC`,
      [vehicleId]
    );
    return rows.map(row => this.mapToDismantlingTask(row));
  }

  async create(task: Omit<DismantlingTask, 'id' | 'createdAt' | 'updatedAt' | 'vehicle' | 'parts'>): Promise<DismantlingTask> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO dismantling_tasks (vehicle_id, status, start_date, end_date, operator_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        task.vehicleId,
        task.status,
        task.startDate ?? null,
        task.endDate ?? null,
        task.operatorId ?? null,
      ]
    );
    return this.findById(result.insertId) as Promise<DismantlingTask>;
  }

  async update(id: number, task: Partial<DismantlingTask>): Promise<DismantlingTask | null> {
    const fields: string[] = [];
    const params: any[] = [];

    if (task.vehicleId !== undefined) { fields.push('vehicle_id = ?'); params.push(task.vehicleId); }
    if (task.status !== undefined) { fields.push('status = ?'); params.push(task.status); }
    if (task.startDate !== undefined) { fields.push('start_date = ?'); params.push(task.startDate); }
    if (task.endDate !== undefined) { fields.push('end_date = ?'); params.push(task.endDate); }
    if (task.operatorId !== undefined) { fields.push('operator_id = ?'); params.push(task.operatorId); }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    await pool.execute(`UPDATE dismantling_tasks SET ${fields.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM dismantling_tasks WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  private mapToDismantlingTask(row: RowDataPacket): DismantlingTask {
    const task: DismantlingTask = {
      id: row.id,
      vehicleId: row.vehicle_id,
      status: row.status,
      startDate: row.start_date ? row.start_date.toISOString().split('T')[0] : undefined,
      endDate: row.end_date ? row.end_date.toISOString().split('T')[0] : undefined,
      operatorId: row.operator_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    if (row.v_id) {
      task.vehicle = {
        id: row.v_id,
        plateNumber: row.v_plate_number,
        vin: row.v_vin,
        owner: row.v_owner,
        ownerPhone: row.v_owner_phone,
        scrapReason: row.v_scrap_reason,
        transferDate: row.v_transfer_date ? row.v_transfer_date.toISOString().split('T')[0] : undefined,
        status: row.v_status,
        createdBy: row.v_created_by,
        createdAt: row.v_created_at,
        updatedAt: row.v_updated_at,
      };
    }

    return task;
  }
}

export const dismantlingTaskRepository = new DismantlingTaskRepository();
