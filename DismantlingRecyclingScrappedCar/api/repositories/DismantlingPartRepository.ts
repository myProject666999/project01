import { pool } from '../config/database';
import { DismantlingPart } from '../../shared/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class DismantlingPartRepository {
  async findAll(taskId?: number): Promise<DismantlingPart[]> {
    let sql = 'SELECT * FROM dismantling_parts';
    const params: any[] = [];
    if (taskId) {
      sql += ' WHERE task_id = ?';
      params.push(taskId);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return rows.map(row => this.mapToDismantlingPart(row));
  }

  async findById(id: number): Promise<DismantlingPart | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM dismantling_parts WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    return this.mapToDismantlingPart(rows[0]);
  }

  async create(part: Omit<DismantlingPart, 'id' | 'createdAt' | 'updatedAt'>): Promise<DismantlingPart> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO dismantling_parts (task_id, name, category, weight, is_reusable, is_hazardous, is_major_assembly, major_assembly_type, status, dismantled_at, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        part.taskId,
        part.name,
        part.category ?? null,
        part.weight,
        part.isReusable ?? false,
        part.isHazardous ?? false,
        part.isMajorAssembly ?? false,
        part.majorAssemblyType ?? 'none',
        part.status ?? 'pending',
        part.dismantledAt ?? null,
        part.notes ?? null,
      ]
    );
    return this.findById(result.insertId) as Promise<DismantlingPart>;
  }

  async update(id: number, part: Partial<DismantlingPart>): Promise<DismantlingPart | null> {
    const fields: string[] = [];
    const params: any[] = [];

    if (part.taskId !== undefined) { fields.push('task_id = ?'); params.push(part.taskId); }
    if (part.name !== undefined) { fields.push('name = ?'); params.push(part.name); }
    if (part.category !== undefined) { fields.push('category = ?'); params.push(part.category); }
    if (part.weight !== undefined) { fields.push('weight = ?'); params.push(part.weight); }
    if (part.isReusable !== undefined) { fields.push('is_reusable = ?'); params.push(part.isReusable); }
    if (part.isHazardous !== undefined) { fields.push('is_hazardous = ?'); params.push(part.isHazardous); }
    if (part.isMajorAssembly !== undefined) { fields.push('is_major_assembly = ?'); params.push(part.isMajorAssembly); }
    if (part.majorAssemblyType !== undefined) { fields.push('major_assembly_type = ?'); params.push(part.majorAssemblyType); }
    if (part.status !== undefined) { fields.push('status = ?'); params.push(part.status); }
    if (part.dismantledAt !== undefined) { fields.push('dismantled_at = ?'); params.push(part.dismantledAt); }
    if (part.notes !== undefined) { fields.push('notes = ?'); params.push(part.notes); }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    await pool.execute(`UPDATE dismantling_parts SET ${fields.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  }

  async updateStatus(id: number, status: DismantlingPart['status']): Promise<DismantlingPart | null> {
    await pool.execute(
      'UPDATE dismantling_parts SET status = ? WHERE id = ?',
      [status, id]
    );
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM dismantling_parts WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  private mapToDismantlingPart(row: RowDataPacket): DismantlingPart {
    return {
      id: row.id,
      taskId: row.task_id,
      name: row.name,
      category: row.category,
      weight: row.weight,
      isReusable: row.is_reusable,
      isHazardous: row.is_hazardous,
      isMajorAssembly: row.is_major_assembly,
      majorAssemblyType: row.major_assembly_type,
      status: row.status,
      dismantledAt: row.dismantled_at,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const dismantlingPartRepository = new DismantlingPartRepository();
