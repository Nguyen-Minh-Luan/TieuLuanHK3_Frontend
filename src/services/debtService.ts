/**
 * debtService.ts
 * HTTP calls tới backend /debts endpoint.
 * Theo pattern của fundService.ts.
 */

import apiClient from './apiClient';
import type { ApiResponse, PagedResponse } from '../features/transaction/apiTypes';
import type { DebtResponse, DebtRequest, DebtSummary } from '../features/debt/apiTypes';

// ─── Params ───────────────────────────────────────────────────────────────────

export interface DebtFetchParams {
  keyword?: string;
  debtType?: 'RECEIVABLE' | 'PAYABLE';
  isPaid?: boolean;
  page?: number;    // 1-based
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// ─── Service ──────────────────────────────────────────────────────────────────

const debtService = {
  /** GET /debts — Danh sách có phân trang & filter */
  getAll: async (params: DebtFetchParams = {}) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<DebtResponse>>>('/debts', {
      params: {
        ...params,
        page: params.page ?? 1,
        size: params.size ?? 10,
        sortBy: params.sortBy ?? 'createdAt',
        sortDir: params.sortDir ?? 'desc',
      },
    });
    return res.data.data;
  },

  /** GET /debts/:id — Chi tiết 1 khoản nợ (kèm payments) */
  getById: async (id: number) => {
    const res = await apiClient.get<ApiResponse<DebtResponse>>(`/debts/${id}`);
    return res.data.data;
  },

  /** POST /debts — Tạo khoản nợ mới */
  create: async (data: DebtRequest) => {
    const res = await apiClient.post<ApiResponse<DebtResponse>>('/debts', data);
    return res.data.data;
  },

  /** PATCH /debts/:id — Cập nhật khoản nợ */
  update: async (id: number, data: Partial<DebtRequest>) => {
    const res = await apiClient.patch<ApiResponse<DebtResponse>>(`/debts/${id}`, data);
    return res.data.data;
  },

  /** DELETE /debts/:id — Xóa mềm */
  delete: async (id: number) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/debts/${id}`);
    return res.data;
  },

  /** GET /debts/summary — Tổng nợ phải thu & phải trả còn lại */
  getSummary: async (): Promise<DebtSummary> => {
    const res = await apiClient.get<ApiResponse<DebtSummary>>('/debts/summary');
    return res.data.data;
  },

  /** GET /debts/unpaid — Tất cả nợ chưa trả hết */
  getUnpaid: async () => {
    const res = await apiClient.get<ApiResponse<DebtResponse[]>>('/debts/unpaid');
    return res.data.data;
  },

  /** GET /debts/unpaid/:debtType — Nợ chưa trả theo loại */
  getUnpaidByType: async (debtType: 'RECEIVABLE' | 'PAYABLE') => {
    const res = await apiClient.get<ApiResponse<DebtResponse[]>>(`/debts/unpaid/${debtType}`);
    return res.data.data;
  },
};

export default debtService;
