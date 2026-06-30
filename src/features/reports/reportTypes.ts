/**
 * reportTypes.ts
 * Kiểu dữ liệu cho Report feature — map với ReportDTO & ReportResponseDTO của backend.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ReportType = 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
export type ReportStatus = 'DRAFT' | 'PUBLISHED';

// ─── Request payload (POST/PATCH /reports) ────────────────────────────────────

export interface ReportRequest {
  title: string;
  type: ReportType;
  fromDate: string; // ISO yyyy-MM-dd
  toDate: string;   // ISO yyyy-MM-dd
  note?: string;
  status: ReportStatus;
  createdBy: number; // userId
}

// ─── Response (GET /reports, GET /reports/{id}) ───────────────────────────────

export interface ReportResponse {
  id: number;
  title: string;
  type: ReportType;
  fromDate: string;
  toDate: string;
  note?: string;
  status: ReportStatus;
  createdBy: number;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;

  // Chỉ tiêu thu/chi
  totalIncome: number;
  totalExpense: number;
  netBalance: number;

  // Tài sản (cuối kỳ)
  cashAndEquivalents: number;      // Mã 110
  accountsReceivable: number;      // Mã 120
  totalAssets: number;             // Mã 200

  // Nguồn vốn (cuối kỳ)
  accountsPayable: number;         // Mã 310
  taxPayable: number;              // Mã 320
  totalLiabilities: number;        // Mã 300
  ownerEquity: number;             // Mã 410
  totalEquity: number;             // Mã 400
  totalLiabilitiesAndEquity: number; // Mã 500

  // Số đầu năm (Beginning of Year)
  cashAndEquivalentsBoy?: number;
  accountsReceivableBoy?: number;
  totalAssetsBoy?: number;
  accountsPayableBoy?: number;
  taxPayableBoy?: number;
  totalLiabilitiesBoy?: number;
  ownerEquityBoy?: number;
  totalEquityBoy?: number;
  totalLiabilitiesAndEquityBoy?: number;

  transactionCount?: number;
}

// ─── Fetch params (GET /reports query string) ─────────────────────────────────

export interface ReportFetchParams {
  keyword?: string;
  type?: ReportType;
  status?: ReportStatus;
  createdBy?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;   // 1-based
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// ─── Label helpers ────────────────────────────────────────────────────────────

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  MONTHLY:   'Hàng tháng',
  QUARTERLY: 'Hàng quý',
  YEARLY:    'Hàng năm',
  CUSTOM:    'Tùy chỉnh',
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  DRAFT:     'Bản nháp',
  PUBLISHED: 'Đã phát hành',
};
