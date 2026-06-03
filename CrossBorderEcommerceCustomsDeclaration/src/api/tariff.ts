import request from './request';
import type { ApiResponse, TariffRecord, PaginatedResponse } from '@/types';

export interface GetTariffsParams {
  page: number;
  pageSize: number;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
}

export interface TariffStatistics {
  total_tariff: number;
  paid_tariff: number;
  unpaid_tariff: number;
}

export function getTariffs(params: GetTariffsParams) {
  return request.get<ApiResponse<PaginatedResponse<TariffRecord>>>('/tariffs', { params });
}

export function getTariff(id: number) {
  return request.get<ApiResponse<TariffRecord>>(`/tariffs/${id}`);
}

export function payTariff(id: number) {
  return request.put<ApiResponse<null>>(`/tariffs/${id}/pay`);
}

export function getStatistics(params?: { startDate?: string; endDate?: string }) {
  return request.get<ApiResponse<TariffStatistics>>('/tariffs/statistics', { params });
}
