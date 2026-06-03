import request from './request';
import type { ApiResponse, DashboardStats, PendingTask, TrendItem } from '@/types';

export function getStats() {
  return request.get<ApiResponse<DashboardStats>>('/dashboard/stats');
}

export function getPendingTasks() {
  return request.get<ApiResponse<PendingTask[]>>('/dashboard/pending-tasks');
}

export function getTrend(days: number) {
  return request.get<ApiResponse<TrendItem[]>>('/dashboard/trend', {
    params: { days },
  });
}
