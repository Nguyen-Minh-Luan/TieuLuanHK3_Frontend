/**
 * categoryService.ts
 * HTTP calls tới backend /categories endpoint.
 * Theo pattern của fundService.ts.
 */

import apiClient from './apiClient';
import type { ApiResponse, PagedResponse } from '../features/transaction/apiTypes';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategoryDTO {
  id?: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  budgeting?: number;   // hạn mức ngân sách
  tax?: number;         // % thuế
  parentId?: number;    // null = danh mục gốc
  parentName?: string;  // response only
  accountCode?: string;
  accountName?: string; // response only
}

/** Node trong cây cha–con trả về từ GET /categories/tree */
export interface CategoryTreeNode extends CategoryDTO {
  children?: CategoryTreeNode[];
}

export interface CategoryFetchParams {
  keyword?: string;
  type?: 'INCOME' | 'EXPENSE';
  parentId?: number;
  page?: number;   // 1-based
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// ─── Service ──────────────────────────────────────────────────────────────────

const categoryService = {
  /** GET /categories/tree — Danh sách cây cha–con (không phân trang, dùng cho dropdown) */
  getTree: async (): Promise<CategoryTreeNode[]> => {
    const res = await apiClient.get<ApiResponse<CategoryTreeNode[]>>('/categories/tree');
    return res.data.data;
  },

  /** GET /categories — Danh sách phẳng có phân trang & filter */
  getAll: async (params: CategoryFetchParams = {}) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<CategoryDTO>>>('/categories', {
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

  /** POST /categories — Tạo danh mục mới */
  create: async (data: Omit<CategoryDTO, 'id' | 'parentName'>) => {
    const res = await apiClient.post<ApiResponse<CategoryDTO>>('/categories', data);
    return res.data.data;
  },

  /** PATCH /categories/:id — Cập nhật danh mục */
  update: async (id: number, data: Partial<Omit<CategoryDTO, 'id' | 'parentName'>>) => {
    const res = await apiClient.patch<ApiResponse<CategoryDTO>>(`/categories/${id}`, data);
    return res.data.data;
  },

  /** DELETE /categories/:id — Xóa mềm (chuyển INACTIVE) */
  delete: async (id: number) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/categories/${id}`);
    return res.data;
  },
};

export default categoryService;
