/**
 * Reconciliation Feature — API Types
 * Đồng bộ với FundReconciliationDTO.java và FundReconciliationRequest.java
 */

export type ReconciliationStatus = 'DRAFT' | 'CLOSED' | 'REOPENED';

export interface ReconciliationResponse {
  id: number;
  fundId: number;
  fundName: string;
  groupCode?: string;
  periodStart: string;   // ISO date
  periodEnd: string;     // ISO date
  openingBalanceSystem: number;
  closingBalanceSystem: number;
  actualBalance?: number;
  difference?: number;
  status: ReconciliationStatus;
  note?: string;
  createdBy?: string;
  createdAt?: string;
  closedBy?: string;
  closedAt?: string;
  reopenedBy?: string;
  reopenedAt?: string;
  reopenReason?: string;
}

export interface ReconciliationRequest {
  fundIds: number[];
  periodStart: string;   // ISO date (yyyy-MM-dd)
  periodEnd: string;     // ISO date (yyyy-MM-dd)
}

export interface ReconciliationUpdateRequest {
  actualBalance?: number;
  note?: string;
}
