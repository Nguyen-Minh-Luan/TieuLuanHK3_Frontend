import apiClient from './apiClient';
import type { ApiResponse, PagedResponse } from '../features/transaction/apiTypes';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OriginalDocumentDTO {
  id?: number;
  documentCode?: string;
  transactionId?: number;
  fileName?: string;
  contentType?: string;
  description?: string;
  uploadedById?: number;
  uploadedByName?: string;
  createdAt?: string;
}

export interface DocumentFetchParams {
  transactionId?: number;
  unlinkedOnly?: boolean;
  documentCode?: string;
  page?: number;
  size?: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

const documentService = {
  /** GET /original-documents — Lấy danh sách có phân trang & filter */
  getAll: async (params: DocumentFetchParams = {}) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<OriginalDocumentDTO>>>('/original-documents', {
      params: {
        ...params,
        page: params.page ?? 1,
        size: params.size ?? 10,
      },
    });
    return res.data.data;
  },

  /** GET /original-documents/:id */
  getById: async (id: number) => {
    const res = await apiClient.get<ApiResponse<OriginalDocumentDTO>>(`/original-documents/${id}`);
    return res.data.data;
  },
  
  /** Fetch image as blob and return object URL (cần để kèm Authorization header) */
  fetchImageAsBlobUrl: async (id: number): Promise<string> => {
    const res = await apiClient.get(`/original-documents/${id}/image`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(res.data);
  },

  /** POST /original-documents — Upload file (multipart/form-data) */
  upload: async (file: File, description?: string, transactionId?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (transactionId) formData.append('transactionId', transactionId.toString());

    const res = await apiClient.post<ApiResponse<OriginalDocumentDTO>>('/original-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  /** PATCH /original-documents/:id/link/:transactionId — Gắn vào giao dịch */
  linkTransaction: async (id: number, transactionId: number) => {
    const res = await apiClient.patch<ApiResponse<OriginalDocumentDTO>>(`/original-documents/${id}/link/${transactionId}`);
    return res.data.data;
  },

  /** PATCH /original-documents/:id/unlink — Gỡ liên kết */
  unlinkTransaction: async (id: number) => {
    const res = await apiClient.patch<ApiResponse<OriginalDocumentDTO>>(`/original-documents/${id}/unlink`);
    return res.data.data;
  },

  /** DELETE /original-documents/:id — Xóa chứng từ */
  remove: async (id: number) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/original-documents/${id}`);
    return res.data;
  },
};

export default documentService;
