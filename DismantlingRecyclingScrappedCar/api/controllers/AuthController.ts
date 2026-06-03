import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { authService } from '../services/AuthService';
import type { ApiResponse, LoginRequest, LoginResponse } from '../../shared/types';

class AuthController {
  async login(req: AuthRequest, res: Response<ApiResponse<LoginResponse | null>>): Promise<void> {
    try {
      const credentials: LoginRequest = req.body;

      if (!credentials.username || !credentials.password) {
        res.status(400).json({
          success: false,
          error: '用户名和密码不能为空',
        });
        return;
      }

      const result = await authService.login(credentials);

      if (!result) {
        res.status(401).json({
          success: false,
          error: '用户名或密码错误',
        });
        return;
      }

      res.json({
        success: true,
        data: result,
        message: '登录成功',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '登录失败',
      });
    }
  }
}

export const authController = new AuthController();
