/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import apiClient from "./apiClient";
import type {
  TransactionRequest,
  TransactionResponse,
  TransactionWithWarning,
  PagedResponse,
  ApiResponse,
  SpendingWarning,
} from "../features/transaction/apiTypes";

export interface FetchParams {
  keyword?: string;
  type?: string;
  status?: string;
  fundId?: number;
  categoryId?: number;
  partnerId?: number;
  userId?: number;
  fromDate?: string;
  toDate?: string;
  page?: number; // 1-based (according to backend PagedResponseDTO)
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

const transactionService = {
  // Fetch transactions list (with filtering and pagination)
  getAll: async (params: FetchParams = {}) => {
    const res = await apiClient.get<ApiResponse<PagedResponse<TransactionResponse>>>(
      "/transactions",
      { params }
    );
    return res.data.data;
  },

  // Fetch detail of a single transaction
  getById: async (id: number) => {
    const res = await apiClient.get<ApiResponse<TransactionResponse>>(
      `/transactions/${id}`
    );
    return res.data.data;
  },

  // Create a new transaction (returns transaction and optional spending warning)
  create: async (data: TransactionRequest, files?: File[], descriptions?: string[]) => {
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append(
        "transaction",
        new Blob([JSON.stringify(data)], { type: "application/json" })
      );
      
      files.forEach((file, index) => {
        formData.append("files", file);
        const desc = (descriptions && descriptions.length > index) ? descriptions[index] : "";
        formData.append("descriptions", desc);
      });

      const res = await apiClient.post<ApiResponse<TransactionWithWarning>>(
        "/transactions/with-documents",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data;
    } else {
      const res = await apiClient.post<ApiResponse<TransactionWithWarning>>(
        "/transactions",
        data
      );
      return res.data;
    }
  },

  // Update an existing transaction
  update: async (id: number, data: TransactionRequest) => {
    const res = await apiClient.put<ApiResponse<TransactionResponse>>(
      `/transactions/${id}`,
      data
    );
    return res.data.data;
  },

  // Cancel/Delete a transaction (soft delete & refund)
  cancel: async (id: number) => {
    const res = await apiClient.delete<ApiResponse<void>>(
      `/transactions/${id}`
    );
    return res.data;
  },

  // Get total income
  getTotalIncome: async () => {
    const res = await apiClient.get<ApiResponse<number>>("/transactions/total-income");
    return res.data.data;
  },

  // Get total expense
  getTotalExpense: async () => {
    const res = await apiClient.get<ApiResponse<number>>("/transactions/total-expense");
    return res.data.data;
  },

  // Check warning by category
  getWarningByCategory: async (categoryId: number, amount?: number) => {
    const res = await apiClient.get<ApiResponse<SpendingWarning>>(
      `/transactions/categories/${categoryId}`,
      { params: amount !== undefined ? { amount } : undefined }
    );
    return res.data.data;
  },
};

export default transactionService;
