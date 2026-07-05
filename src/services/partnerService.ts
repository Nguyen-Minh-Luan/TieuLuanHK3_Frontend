/**
 * partnerService.ts
 * HTTP calls tới backend /partners endpoint.
 * Theo pattern của categoryService.ts.
 */

import apiClient from './apiClient';
import type { ApiResponse, PagedResponse } from '../features/transaction/apiTypes';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Khớp 100% với backend PartnerDTO (id, name, type, email, address).
 *  Không có phone / note — backend entity không có các field này. */
export interface PartnerDTO {
  id?: number;
  name: string;
  type?: string;
  email: string;
  address?: string;
}

export interface PartnerFetchParams {
  keyword?: string;
  type?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// ─── Service ──────────────────────────────────────────────────────────────────

const partnerService = {
  /** GET /partners — Danh sách đối tác có phân trang & filter */
  getAll: async (params: PartnerFetchParams = {}) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<PartnerDTO>>>('/partners', {
      params: {
        ...params,
        page: params.page ?? 1,
        size: params.size ?? 10,
        sortBy: params.sortBy ?? 'name',
        sortDir: params.sortDir ?? 'asc',
      },
    });
    return res.data.data;
  },

  /** GET /partners — Lấy tất cả (dùng cho dropdown, size lớn) */
  getAllForDropdown: async () => {
    const res = await apiClient.get<ApiResponse<PagedResponse<PartnerDTO>>>('/partners', {
      params: { page: 1, size: 1000, sortBy: 'name', sortDir: 'asc' },
    });
    return res.data.data.content;
  },

  /** GET /partners/:id */
  getById: async (id: number) => {
    const res = await apiClient.get<ApiResponse<PartnerDTO>>(`/partners/${id}`);
    return res.data.data;
  },

  /** POST /partners — Tạo đối tác mới */
  create: async (data: Omit<PartnerDTO, 'id'>) => {
    const res = await apiClient.post<ApiResponse<PartnerDTO>>('/partners', data);
    return res.data.data;
  },

  /** PUT /partners/:id — Cập nhật đối tác */
  update: async (id: number, data: Omit<PartnerDTO, 'id'>) => {
    const res = await apiClient.put<ApiResponse<PartnerDTO>>(`/partners/${id}`, data);
    return res.data.data;
  },

  /** DELETE /partners/:id — Xóa đối tác */
  delete: async (id: number) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/partners/${id}`);
    return res.data;
  },
};

export default partnerService;
