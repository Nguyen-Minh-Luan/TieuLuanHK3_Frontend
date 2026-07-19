/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Counterparty {
  name: string;
  mst: string;
  logoUrl?: string;
}

export interface Creator {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface Transaction {
  id: string;
  apiId?: number; // Backend database ID (optional for mock compatibility)
  debtId?: number; // Backend debt ID if linked
  type: 'PHIẾU CHI' | 'PHIẾU THU';
  status: 'ACTIVE' | 'CANCELLED' | 'UPDATED';
  riskStatus: string; // e.g. "FINE (Ổn định)" or "WARNING (Cảnh báo)" or "RISK (Nguy cơ)"
  sourceOfFunds: string;
  category: string;
  amount: number;
  currency: string; // e.g. "VND"
  limitFluctuations: number[]; // Sparkline dynamic levels
  counterparty: Counterparty;
  creator: Creator;
  date: string; // DD/MM/YYYY
  createdAt: string; // HH:MM:SS - GMT+7
  notes: string;
}

export interface RelatedDebt {
  id: number;
  debtType: 'RECEIVABLE' | 'PAYABLE';
  title?: string;
  partnerName?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  isPaid: boolean;
}

export type SidebarTab = 'dashboard' | 'transactions' | 'reports' | 'budgets' | 'settings';

