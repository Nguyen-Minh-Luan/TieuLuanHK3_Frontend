/**
 * Budget Feature — API Types & Mappers
 *
 * Định nghĩa kiểu dữ liệu nhận từ backend (FundDTO),
 * kiểu gửi lên (FundRequest), và các hàm mapping qua lại.
 */

import type { Fund } from './types';

// ─── Kiểu dữ liệu trả về từ API (khớp với FundDTO.java) ──────────────────────

export interface FundDTO {
  id: number;
  name: string;
  type: string;
  status: string;
  initialBalance: number;   // = totalCapital ở FE
  currentBalance: number;   // = availableBalance ở FE
  code?: string;
  note?: string;
  updatedAt?: string;       // ISO 8601 LocalDateTime string
  accountCode?: string;
}

// ─── Kiểu dữ liệu gửi lên khi tạo / cập nhật quỹ ────────────────────────────

export interface FundRequest {
  name: string;
  type: string;
  status: string;
  initialBalance: number;
  currentBalance?: number;
  code?: string;
  note?: string;
  accountCode?: string;
}

// ─── Hàm mapping: API DTO → Frontend Fund type ───────────────────────────────

export function mapFundDTOToFund(dto: FundDTO): Fund {
  return {
    id: String(dto.id),
    name: dto.name,
    type: dto.type as Fund['type'],
    totalCapital: dto.initialBalance ?? 0,
    availableBalance: dto.currentBalance ?? 0,
    status: dto.status as Fund['status'],
    code: dto.code ?? '',
    note: dto.note ?? '',
    updatedAt: dto.updatedAt ? dto.updatedAt.split('T')[0] : '',
    accountCode: dto.accountCode,
  };
}

// ─── Hàm mapping: Frontend Fund → API Request ─────────────────────────────────

export function mapFundToRequest(fund: Omit<Fund, 'id' | 'updatedAt'>): FundRequest {
  return {
    name: fund.name,
    type: fund.type,
    status: fund.status,
    initialBalance: fund.totalCapital,
    currentBalance: fund.availableBalance,
    code: fund.code,
    note: fund.note,
    accountCode: fund.accountCode,
  };
}
