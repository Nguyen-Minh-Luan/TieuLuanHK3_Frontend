/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Request body for creating/updating a transaction
export interface TransactionRequest {
  fundId: number;
  categoryId: number;
  partnerId?: number;
  userId: number;
  type: "INCOME" | "EXPENSE";
  amount: number;
  note?: string;
  transactionDate: string; // ISO date string (yyyy-MM-dd)
  reason?: string;
  accompaniedBy?: string;
  originalDocuments?: string;
  debtId?: number;
}

// Response body returned by the API
export interface TransactionResponse {
  id: number;
  parentId?: number;
  fundId: number;
  categoryId: number;
  partnerId?: number;
  userId: number;
  type: string;
  status: string; // "ACTIVE" | "UPDATED" | "CANCELLED"
  amount: number;
  note?: string;
  transactionCode: string;
  transactionDate: string; // ISO string
  createdAt: string; // ISO string
  hasWarning: boolean;
  reason?: string;
  accompaniedBy?: string;
  originalDocuments?: string;
  debtId?: number;
}

// Spending Warning analysis result DTO
export interface SpendingWarning {
  hasWarning: boolean;
  categoryName: string;
  currentMonthTotal: number;
  historicalAverage: number;
  overagePercent: number;
  message: string;
  level: "NORMAL" | "WARNING" | "CRITICAL";
}

// Wrapper for created transaction + warning
export interface TransactionWithWarning {
  transaction: TransactionResponse;
  warning?: SpendingWarning;
}

// Unified paginated response wrapper from backend
export interface PagedResponse<T> {
  content: T[];
  page: number; // 1-based index
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// General API Response wrapper
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  timestamp: string;
}
