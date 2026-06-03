import request from './request';
import type { ApiResponse, Declaration, DeclarationItem, PaginatedResponse } from '@/types';

export interface GetDeclarationsParams {
  page: number;
  pageSize: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export function getDeclarations(params: GetDeclarationsParams) {
  return request.get<ApiResponse<PaginatedResponse<Declaration>>>('/declarations', { params });
}

export function getDeclaration(id: number) {
  return request.get<ApiResponse<Declaration>>(`/declarations/${id}`);
}

export function createDeclaration(data: { order_ids: number[] }) {
  return request.post<ApiResponse<Declaration>>('/declarations', data);
}

export function submitDeclaration(id: number) {
  return request.post<ApiResponse<null>>(`/declarations/${id}/submit`);
}

export function rejectDeclaration(id: number, data: { reject_reason: string; reject_type: string }) {
  return request.post<ApiResponse<null>>(`/declarations/${id}/reject`, data);
}

export function resubmitDeclaration(id: number) {
  return request.post<ApiResponse<null>>(`/declarations/${id}/resubmit`);
}

export function updateDeclarationItem(declarationId: number, itemId: number, data: Partial<Omit<DeclarationItem, 'id' | 'declaration_id' | 'created_at' | 'updated_at'>>) {
  return request.put<ApiResponse<DeclarationItem>>(`/declarations/${declarationId}/items/${itemId}`, data);
}
