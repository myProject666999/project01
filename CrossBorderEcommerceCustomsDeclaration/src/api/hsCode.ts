import request from './request';
import type { ApiResponse, HSCode, CategoryMapping, OrderItem, PaginatedResponse } from '@/types';

export interface GetHsCodesParams {
  page: number;
  pageSize: number;
  category?: string;
  keyword?: string;
}

export function getHsCodes(params: GetHsCodesParams) {
  return request.get<ApiResponse<PaginatedResponse<HSCode>>>('/hs-codes', { params });
}

export function getHsCode(code: string) {
  return request.get<ApiResponse<HSCode>>(`/hs-codes/${code}`);
}

export function createHsCode(data: Omit<HSCode, 'id' | 'created_at' | 'updated_at' | 'category_mappings'>) {
  return request.post<ApiResponse<HSCode>>('/hs-codes', data);
}

export function updateHsCode(code: string, data: Partial<Omit<HSCode, 'id' | 'created_at' | 'updated_at' | 'category_mappings'>>) {
  return request.put<ApiResponse<HSCode>>(`/hs-codes/${code}`, data);
}

export function getMappings(params: { page: number; pageSize: number }) {
  return request.get<ApiResponse<PaginatedResponse<CategoryMapping>>>('/hs-codes/mappings', { params });
}

export function createMapping(data: Omit<CategoryMapping, 'id' | 'created_at' | 'updated_at' | 'hs_code_ref'>) {
  return request.post<ApiResponse<CategoryMapping>>('/hs-codes/mappings', data);
}

export function updateMapping(id: number, data: Partial<Omit<CategoryMapping, 'id' | 'created_at' | 'updated_at' | 'hs_code_ref'>>) {
  return request.put<ApiResponse<CategoryMapping>>(`/hs-codes/mappings/${id}`, data);
}

export function deleteMapping(id: number) {
  return request.delete<ApiResponse<null>>(`/hs-codes/mappings/${id}`);
}

export function autoMatch() {
  return request.post<ApiResponse<null>>('/hs-codes/auto-match');
}

export function getUnmatchedItems(params: { page: number; pageSize: number }) {
  return request.get<ApiResponse<PaginatedResponse<OrderItem>>>('/hs-codes/unmatched', { params });
}

export function manualMatch(itemId: number, hsCode: string) {
  return request.post<ApiResponse<null>>('/hs-codes/manual-match', {
    item_id: itemId,
    hs_code: hsCode,
  });
}
