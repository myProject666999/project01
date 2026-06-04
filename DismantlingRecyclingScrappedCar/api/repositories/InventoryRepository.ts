import { pool } from '../config/database';
import { InventoryItem } from '../../shared/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class InventoryRepository {
  async findAll(status?: string): Promise<InventoryItem[]> {
    let sql = 'SELECT * FROM inventory_items';
    const params: any[] = [];
    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return rows.map(row => this.mapToInventoryItem(row));
  }

  async findById(id: number): Promise<InventoryItem | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM inventory_items WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    return this.mapToInventoryItem(rows[0]);
  }

  async findByPartId(partId: number): Promise<InventoryItem[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM inventory_items WHERE part_id = ? ORDER BY created_at DESC',
      [partId]
    );
    return rows.map(row => this.mapToInventoryItem(row));
  }

  async create(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO inventory_items (part_id, part_name, quantity, weight, location, in_date, out_date, price, buyer, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.partId,
        item.partName,
        item.quantity ?? 1,
        item.weight,
        item.location ?? null,
        item.inDate,
        item.outDate ?? null,
        item.price ?? null,
        item.buyer ?? null,
        item.status ?? 'in_stock',
      ]
    );
    return this.findById(result.insertId) as Promise<InventoryItem>;
  }

  async update(id: number, item: Partial<InventoryItem>): Promise<InventoryItem | null> {
    const fields: string[] = [];
    const params: any[] = [];

    if (item.partId !== undefined) { fields.push('part_id = ?'); params.push(item.partId); }
    if (item.partName !== undefined) { fields.push('part_name = ?'); params.push(item.partName); }
    if (item.quantity !== undefined) { fields.push('quantity = ?'); params.push(item.quantity); }
    if (item.weight !== undefined) { fields.push('weight = ?'); params.push(item.weight); }
    if (item.location !== undefined) { fields.push('location = ?'); params.push(item.location); }
    if (item.inDate !== undefined) { fields.push('in_date = ?'); params.push(item.inDate); }
    if (item.outDate !== undefined) { fields.push('out_date = ?'); params.push(item.outDate); }
    if (item.price !== undefined) { fields.push('price = ?'); params.push(item.price); }
    if (item.buyer !== undefined) { fields.push('buyer = ?'); params.push(item.buyer); }
    if (item.status !== undefined) { fields.push('status = ?'); params.push(item.status); }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    await pool.execute(`UPDATE inventory_items SET ${fields.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  }

  async markAsSold(id: number, data: { outDate: string; price?: number; buyer?: string }): Promise<InventoryItem | null> {
    const fields: string[] = ['status = ?', 'out_date = ?'];
    const params: any[] = ['sold', data.outDate];

    if (data.price !== undefined) { fields.push('price = ?'); params.push(data.price); }
    if (data.buyer !== undefined) { fields.push('buyer = ?'); params.push(data.buyer); }

    params.push(id);
    await pool.execute(`UPDATE inventory_items SET ${fields.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  }

  private mapToInventoryItem(row: RowDataPacket): InventoryItem {
    return {
      id: row.id,
      partId: row.part_id,
      partName: row.part_name,
      quantity: row.quantity,
      weight: row.weight,
      location: row.location,
      inDate: row.in_date ? row.in_date.toISOString().split('T')[0] : undefined,
      outDate: row.out_date ? row.out_date.toISOString().split('T')[0] : undefined,
      price: row.price,
      buyer: row.buyer,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const inventoryRepository = new InventoryRepository();
