/**
 * Debt Feature — API Types
 *
 * Định nghĩa kiểu dữ liệu nhận từ backend (DebtResponse),
 * kiểu gửi lên (DebtRequest), và các kiểu phụ trợ.
 * Đây là nguồn sự thật (single source of truth) cho dữ liệu nợ.
 *
 * Đặt tên đồng bộ với backend:
 *   - DebtResponse  ↔  DebtResponse.java  (output từ server)
 *   - DebtRequest   ↔  DebtRequest.java   (input từ client)
 */

import type { TransactionResponse } from '../transaction/apiTypes';

// ─── Kiểu dữ liệu trả về từ API (khớp với DebtResponse.java) ─────────────────

export interface DebtResponse {
  id?: number;
  debtDate: string;              // ISO date (yyyy-MM-dd)
  debtType: 'RECEIVABLE' | 'PAYABLE';
  totalAmount: number;
  paidAmount?: number;           // server tự tính / tự cập nhật
  isPaid?: boolean;              // server tự set khi paidAmount >= totalAmount
  paymentDate?: string;          // server ghi nhận khi isPaid = true
  remainingAmount?: number;      // = totalAmount - paidAmount (server tính)

  partnerId?: number;
  categoryId?: number;
  userId?: number;

  partnerName?: string;          // response only — tên hiển thị
  categoryName?: string;         // response only
  createdByName?: string;        // response only

  title?: string;
  note?: string;
  createdAt?: string;            // ISO datetime
  updatedAt?: string;            // ISO datetime

  payments?: TransactionResponse[]; // chỉ có khi GET /debts/{id}
}

/**
 * @deprecated Dùng `DebtResponse` thay thế.
 * Alias này giúp tránh lỗi khi refactor dần các component cũ còn tham chiếu DebtDTO.
 */
export type DebtDTO = DebtResponse;

// ─── Kiểu dữ liệu gửi lên khi tạo / cập nhật nợ ─────────────────────────────

export interface DebtRequest {
  debtDate: string;              // ISO date (yyyy-MM-dd). Bắt buộc.
  debtType: 'RECEIVABLE' | 'PAYABLE'; // Bắt buộc.
  totalAmount: number;           // Bắt buộc; > 0.
  partnerId: number;             // Bắt buộc.
  categoryId?: number;           // Tùy chọn.
  userId?: number;               // Bắt buộc khi tạo. TODO: lấy từ JWT sau khi tích hợp auth.
  title?: string;                // Bắt buộc khi tạo.
  note?: string;                 // Tùy chọn.
}

// ─── Tổng hợp từ GET /debts/summary ─────────────────────────────────────────

export interface DebtSummary {
  totalRemainingReceivable: number; // khớp với key từ backend Map<String, Double>
  totalRemainingPayable: number;
}
