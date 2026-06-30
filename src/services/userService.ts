import apiClient from './apiClient';
import type { UserDTO, UserRequest } from '../features/admin/userManager/apiTypes';
import type { ApiResponse, PagedResponse } from '../features/transaction/apiTypes';

export interface UserFetchParams {
  keyword?: string;
  role?: number;
  status?: string;
  page?: number;   // 1-based (theo backend PagedResponseDTO)
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

const userService = {
  /** GET /auth/user — Lấy danh sách user */
  getAll: async (params: UserFetchParams = {}) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<UserDTO>>>('/auth/user', {
      params: {
        ...params,
        page: params.page ?? 1,
        size: params.size ?? 4, // default 4 matching ITEMS_PER_PAGE
      },
    });
    return res.data.data;
  },

  /** POST /auth/user — Tạo user mới */
  create: async (data: UserRequest) => {
    const res = await apiClient.post<ApiResponse<number>>('/auth/user', data);
    return res.data;
  },

  /** PATCH /auth/user/:id — Cập nhật user */
  update: async (id: number, data: Partial<UserRequest>) => {
    const res = await apiClient.patch<ApiResponse<void>>(`/auth/user/${id}`, data);
    return res.data;
  },

  /** DELETE /auth/user/:id — Xóa user (soft delete) */
  delete: async (id: number) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/auth/user/${id}`);
    return res.data;
  },
};

export default userService;
