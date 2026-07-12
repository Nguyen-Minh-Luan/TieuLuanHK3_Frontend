/**
 * reconciliationService.ts
 * HTTP calls tới backend /reconciliations endpoint.
 */

import apiClient from './apiClient';
import type { ApiResponse, PagedResponse } from '../features/transaction/apiTypes';
import type {
  ReconciliationResponse,
  ReconciliationRequest,
  ReconciliationUpdateRequest,
} from '../features/reconciliation/apiTypes';

export interface ReconciliationFetchParams {
  fundId?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

const reconciliationService = {
  /** GET /reconciliations — Danh sách phiên kiểm kê */
  getAll: async (params: ReconciliationFetchParams = {}) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<ReconciliationResponse>>>(
      '/reconciliations',
      { params: { page: 1, size: 10, sortBy: 'periodEnd', sortDir: 'DESC', ...params } }
    );
    return res.data.data;
  },

  /** GET /reconciliations/:id — Chi tiết phiên kiểm kê */
  getById: async (id: number) => {
    const res = await apiClient.get<ApiResponse<ReconciliationResponse>>(`/reconciliations/${id}`);
    return res.data.data;
  },

  /** POST /reconciliations — Tạo phiên mới (1 hoặc nhiều quỹ) */
  create: async (data: ReconciliationRequest) => {
    const res = await apiClient.post<ApiResponse<ReconciliationResponse[]>>('/reconciliations', data);
    return res.data.data;
  },

  /** PATCH /reconciliations/:id — Cập nhật actualBalance và note (chỉ khi DRAFT) */
  update: async (id: number, data: ReconciliationUpdateRequest) => {
    const res = await apiClient.patch<ApiResponse<ReconciliationResponse>>(
      `/reconciliations/${id}`,
      data
    );
    return res.data.data;
  },

  /** POST /reconciliations/:id/close — Chốt kiểm kê */
  close: async (id: number) => {
    const res = await apiClient.post<ApiResponse<ReconciliationResponse>>(
      `/reconciliations/${id}/close`
    );
    return res.data.data;
  },

  /** POST /reconciliations/:id/reopen — Mở khóa kỳ đã chốt (Admin only) */
  reopen: async (id: number, reason: string) => {
    const res = await apiClient.post<ApiResponse<ReconciliationResponse>>(
      `/reconciliations/${id}/reopen`,
      { reason }
    );
    return res.data.data;
  },

  /** DELETE /reconciliations/:id — Xóa phiên nháp */
  delete: async (id: number) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/reconciliations/${id}`);
    return res.data;
  },

  /** GET /reconciliations/lock-check?fundId=&date= — Kiểm tra ngày có bị khóa không */
  checkLock: async (fundId: number, date: string): Promise<boolean> => {
    const res = await apiClient.get<ApiResponse<boolean>>('/reconciliations/lock-check', {
      params: { fundId, date },
    });
    return res.data.data ?? false;
  },
};

export default reconciliationService;
