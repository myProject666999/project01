import request from './request';
import type { ApiResponse, Order, PaginatedResponse } from '@/types';

export interface GetOrdersParams {
  page: number;
  pageSize: number;
  platform?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export function getOrders(params: GetOrdersParams) {
  return request.get<ApiResponse<PaginatedResponse<Order>>>('/orders', { params });
}

export function getOrder(id: number) {
  return request.get<ApiResponse<Order>>(`/orders/${id}`);
}

export function syncOrders(platform: string) {
  return request.post<ApiResponse<null>>('/orders/sync', null, {
    params: { platform },
  });
}
