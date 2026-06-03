import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { User, LoginRequest, LoginResponse } from '../../shared/types';

export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'scrap_car_management_secret_key_2026';

  async login(credentials: LoginRequest): Promise<LoginResponse | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = ?',
      [credentials.username]
    );

    if (rows.length === 0) return null;

    const userRow = rows[0];
    
    const isPasswordValid = await bcrypt.compare(credentials.password, userRow.password);
    if (!isPasswordValid) return null;

    const user: User = {
      id: userRow.id,
      username: userRow.username,
      name: userRow.name,
      role: userRow.role,
      phone: userRow.phone,
      createdAt: userRow.created_at,
    };

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      this.jwtSecret,
      { expiresIn: '24h' }
    );

    return { token, user };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  verifyToken(token: string): any {
    return jwt.verify(token, this.jwtSecret);
  }
}

export const authService = new AuthService();
