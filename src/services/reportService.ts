/**
 * reportService.ts
 * HTTP calls tới backend /reports endpoint.
 * Theo pattern của fundService.ts / transactionService.ts.
 */

import apiClient from './apiClient';
import type { ReportRequest, ReportResponse, ReportFetchParams, ReportType } from '../features/reports/reportTypes';
import type { ApiResponse, PagedResponse } from '../features/transaction/apiTypes';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const reportService = {
  /** GET /reports — Danh sách báo cáo có phân trang & filter */
  getAll: async (params: ReportFetchParams = {}) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<ReportResponse>>>('/reports', {
      params: {
        ...params,
        page: params.page ?? 1,
        size: params.size ?? 10,
      },
    });
    return res.data.data;
  },

  /** GET /reports/{id} — Chi tiết một báo cáo */
  getById: async (id: number) => {
    const res = await apiClient.get<ApiResponse<ReportResponse>>(`/reports/${id}`);
    return res.data.data;
  },

  /** GET /reports/type/{type} — Lọc theo loại */
  getByType: async (type: ReportType) => {
    const res = await apiClient.get<ApiResponse<ReportResponse[]>>(`/reports/type/${type}`);
    return res.data.data;
  },

  /** GET /reports/user/{userId} — Báo cáo theo người tạo */
  getByUser: async (userId: number) => {
    const res = await apiClient.get<ApiResponse<ReportResponse[]>>(`/reports/user/${userId}`);
    return res.data.data;
  },

  /** POST /reports — Tạo báo cáo mới */
  create: async (data: ReportRequest) => {
    const res = await apiClient.post<ApiResponse<ReportResponse>>('/reports', data);
    return res.data.data;
  },

  /** PATCH /reports/{id} — Cập nhật báo cáo */
  update: async (id: number, data: Partial<ReportRequest>) => {
    const res = await apiClient.patch<ApiResponse<ReportResponse>>(`/reports/${id}`, data);
    return res.data.data;
  },

  /** DELETE /reports/{id} — Xóa mềm báo cáo */
  delete: async (id: number) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/reports/${id}`);
    return res.data;
  },

  /** POST /reports/{id}/recalculate — Tái tính số liệu */
  recalculate: async (id: number) => {
    const res = await apiClient.post<ApiResponse<ReportResponse>>(`/reports/${id}/recalculate`);
    return res.data.data;
  },

  /**
   * Trả về URL để mở/tải PDF báo cáo trong tab mới.
   * Endpoint GET /pdf/reports/{id} là permitAll, không cần token.
   */
  exportPdfUrl: (id: number) => `${BASE_URL}/pdf/reports/${id}`,
};

export default reportService;
