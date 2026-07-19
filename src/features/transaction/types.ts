/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  date: string;
  time: string;
  description: string;
  refId: string;
  category: string;
  amount: number; // Negative for expense, positive for revenue
  overSpending: "Critical" | "Warning" | "Fine";
  status: 'ACTIVE' | 'CANCELLED' | 'UPDATED';
  icon: "building" | "payment" | "maintenance" | "cloud" | "payroll" | "other";
  // Metadata fields for edit mode pre-fill
  categoryId?: number;
  fundId?: number;
  partnerId?: number;
  debtId?: number;
  rawNote?: string;
  rawType?: string;
  rawDate?: string;
}

export interface Budget {
  category: string;
  allocated: number;
  spent: number;
  color: string;
}

export type ViewType =
  | "Dashboard"
  | "Transactions"
  | "Budgets"
  | "Settings";
