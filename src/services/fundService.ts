/**
 * fundService.ts
 * HTTP calls tới backend /funds endpoint.
 * Theo pattern của transactionService.ts.
 */

import apiClient from './apiClient';
import type { FundDTO, FundRequest } from '../features/budget/apiTypes';
import type { ApiResponse, PagedResponse } from '../features/transaction/apiTypes';

export interface FundFetchParams {
  keyword?: string;
  type?: string;
  status?: string;
  page?: number;   // 1-based (theo backend PagedResponseDTO)
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

const fundService = {
  /** GET /funds — Lấy danh sách quỹ có phân trang & filter */
  getAll: async (params: FundFetchParams = {}) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<FundDTO>>>('/funds', {
      params: {
        ...params,
        page: params.page ?? 1,
        size: params.size ?? 10,
      },
    });
    return res.data.data;
  },

  /** POST /funds — Tạo quỹ mới */
  create: async (data: FundRequest) => {
    const res = await apiClient.post<ApiResponse<FundDTO>>('/funds', data);
    return res.data.data;
  },

  /** PATCH /funds/:id — Cập nhật quỹ */
  update: async (id: number, data: Partial<FundRequest>) => {
    const res = await apiClient.patch<ApiResponse<FundDTO>>(`/funds/${id}`, data);
    return res.data.data;
  },

  /** DELETE /funds/:id — Xóa quỹ (soft delete) */
  delete: async (id: number) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/funds/${id}`);
    return res.data;
  },

  /** GET /funds/total-balance — Tổng số dư tất cả các quỹ */
  getTotalBalance: async () => {
    const res = await apiClient.get<ApiResponse<{ totalBalance: number }>>('/funds/total-balance');
    return res.data.data;
  },
};

export default fundService;
