import request from './request';
import type { ApiResponse, CustomsArchive, PaginatedResponse } from '@/types';

export interface GetArchivesParams {
  page: number;
  pageSize: number;
}

export function getArchives(params: GetArchivesParams) {
  return request.get<ApiResponse<PaginatedResponse<CustomsArchive>>>('/archives', { params });
}

export function getArchive(id: number) {
  return request.get<ApiResponse<CustomsArchive>>(`/archives/${id}`);
}
