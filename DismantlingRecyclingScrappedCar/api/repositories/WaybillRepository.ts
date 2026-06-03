import { pool } from '../config/database';
import { Waybill, HazardousWaste } from '../../shared/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class WaybillRepository {
  async findAll(status?: string): Promise<Waybill[]> {
    let sql = 'SELECT * FROM waybills';
    const params: any[] = [];
    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return rows.map(row => this.mapToWaybill(row));
  }

  async findById(id: number): Promise<Waybill | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM waybills WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    return this.mapToWaybill(rows[0]);
  }

  async findByWaybillNo(waybillNo: string): Promise<Waybill | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM waybills WHERE waybill_no = ?',
      [waybillNo]
    );
    if (rows.length === 0) return null;
    return this.mapToWaybill(rows[0]);
  }

  async create(waybill: Omit<Waybill, 'id' | 'waybillNo' | 'signedBack' | 'createdAt' | 'updatedAt'>): Promise<Waybill> {
    const waybillNo = await this.generateWaybillNo();
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO waybills (waybill_no, disposal_factory, factory_qualification, transfer_date, total_weight, signed_back, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        waybillNo,
        waybill.disposalFactory,
        waybill.factoryQualification,
        waybill.transferDate,
        waybill.totalWeight,
        false,
        waybill.notes,
        waybill.status,
      ]
    );
    return this.findById(result.insertId) as Promise<Waybill>;
  }

  async update(id: number, waybill: Partial<Waybill>): Promise<Waybill | null> {
    const fields: string[] = [];
    const params: any[] = [];

    if (waybill.disposalFactory !== undefined) { fields.push('disposal_factory = ?'); params.push(waybill.disposalFactory); }
    if (waybill.factoryQualification !== undefined) { fields.push('factory_qualification = ?'); params.push(waybill.factoryQualification); }
    if (waybill.transferDate !== undefined) { fields.push('transfer_date = ?'); params.push(waybill.transferDate); }
    if (waybill.totalWeight !== undefined) { fields.push('total_weight = ?'); params.push(waybill.totalWeight); }
    if (waybill.notes !== undefined) { fields.push('notes = ?'); params.push(waybill.notes); }
    if (waybill.status !== undefined) { fields.push('status = ?'); params.push(waybill.status); }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    await pool.execute(`UPDATE waybills SET ${fields.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  }

  async signBack(id: number, userId: number): Promise<Waybill | null> {
    await pool.execute(
      `UPDATE waybills SET signed_back = ?, signed_back_at = NOW(), signed_back_by = ?, status = ? WHERE id = ?`,
      [true, userId, 'completed', id]
    );
    return this.findById(id);
  }

  async addWaste(waybillId: number, wasteId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO waybill_wastes (waybill_id, waste_id) VALUES (?, ?)',
      [waybillId, wasteId]
    );
    return result.affectedRows > 0;
  }

  async getWastes(waybillId: number): Promise<HazardousWaste[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT hw.* FROM hazardous_wastes hw
       INNER JOIN waybill_wastes ww ON hw.id = ww.waste_id
       WHERE ww.waybill_id = ?
       ORDER BY hw.created_at DESC`,
      [waybillId]
    );
    return rows.map(row => this.mapToHazardousWaste(row));
  }

  private async generateWaybillNo(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `WB${year}${month}`;

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT waybill_no FROM waybills WHERE waybill_no LIKE ? ORDER BY waybill_no DESC LIMIT 1`,
      [`${prefix}%`]
    );

    let sequence = 1;
    if (rows.length > 0) {
      const lastNo = rows[0].waybill_no;
      const lastSeq = parseInt(lastNo.slice(-3), 10);
      sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(3, '0')}`;
  }

  private mapToWaybill(row: RowDataPacket): Waybill {
    return {
      id: row.id,
      waybillNo: row.waybill_no,
      disposalFactory: row.disposal_factory,
      factoryQualification: row.factory_qualification,
      transferDate: row.transfer_date ? row.transfer_date.toISOString().split('T')[0] : undefined,
      totalWeight: row.total_weight,
      signedBack: row.signed_back,
      signedBackAt: row.signed_back_at,
      signedBackBy: row.signed_back_by,
      notes: row.notes,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
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

export const waybillRepository = new WaybillRepository();
